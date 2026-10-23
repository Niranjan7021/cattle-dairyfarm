import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory alert history store & deduplication map
interface AlertRecord {
  id: string;
  to: string;
  message: string;
  cowTag: string;
  status: 'sent' | 'ready_for_device' | 'failed' | 'duplicate_suppressed';
  provider: 'twilio' | 'device' | 'none';
  sid?: string;
  timestamp: string;
  error?: string;
}

const alertHistoryStore: AlertRecord[] = [];
const lastAlertTimestampMap: Record<string, number> = {}; // key: `${cowTag}:${messageHash}`
const DEDUPLICATION_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes cooldown to prevent duplicate alerts

// Helper to hash key for deduplication
function getDeduplicationKey(cowTag: string, message: string): string {
  const cleanTag = (cowTag || 'GENERAL').trim().toUpperCase();
  const summary = message.slice(0, 30).trim().toLowerCase();
  return `${cleanTag}:${summary}`;
}

/**
 * GET /api/alerts - Retrieve stored alert history
 */
app.get('/api/alerts', (_req, res) => {
  res.json({
    total: alertHistoryStore.length,
    alerts: alertHistoryStore,
  });
});

/**
 * DELETE /api/alerts - Clear alert history
 */
app.delete('/api/alerts', (_req, res) => {
  alertHistoryStore.length = 0;
  res.json({ success: true, message: 'Alert history cleared.' });
});

/**
 * POST /api/send-sms - Process and send Twilio SMS with deduplication & error handling
 */
app.post('/api/send-sms', async (req, res) => {
  try {
    const { to: inputTo, message, cowTag = 'GENERAL', ignoreDeduplication = false } = req.body;

    const to = inputTo || process.env.OWNER_PHONE_NUMBER || '+919876543210';

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Recipient phone number (to) and message are required.',
      });
    }

    const dedupeKey = getDeduplicationKey(cowTag, message);
    const now = Date.now();
    const lastSent = lastAlertTimestampMap[dedupeKey] || 0;

    // 1. Prevent Duplicate Alerts within Cooldown Window
    if (!ignoreDeduplication && now - lastSent < DEDUPLICATION_COOLDOWN_MS) {
      const remainingMins = Math.ceil((DEDUPLICATION_COOLDOWN_MS - (now - lastSent)) / 60000);
      const suppressedRecord: AlertRecord = {
        id: `suppressed-${Date.now()}`,
        to,
        message,
        cowTag,
        status: 'duplicate_suppressed',
        provider: 'none',
        timestamp: new Date().toISOString(),
        error: `Duplicate alert suppressed. Cooldown active for another ${remainingMins} minutes.`,
      };
      alertHistoryStore.unshift(suppressedRecord);

      return res.json({
        success: true,
        status: 'duplicate_suppressed',
        message: `Duplicate alert for Cow #${cowTag} suppressed (Sent recently). Cooldown: ${remainingMins} mins remaining.`,
        record: suppressedRecord,
      });
    }

    console.log(`[TWILIO SMS DISPATCH] Recipient: ${to} | Cow Tag: ${cowTag}`);
    console.log(`[SMS PAYLOAD] "${message}"`);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Check if real Twilio credentials are present
    const isTwilioConfigured = Boolean(
      accountSid &&
      accountSid.startsWith('AC') &&
      !accountSid.includes('your_') &&
      authToken &&
      !authToken.includes('your_') &&
      fromNumber &&
      !fromNumber.includes('your_')
    );

    // 2. Dispatch via Twilio API if credentials are valid
    if (isTwilioConfigured) {
      try {
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', to);
        params.append('From', fromNumber!);
        params.append('Body', message);

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );

        const responseData = await twilioRes.json();

        if (twilioRes.ok) {
          lastAlertTimestampMap[dedupeKey] = now;
          const record: AlertRecord = {
            id: responseData.sid || `twilio-${Date.now()}`,
            to,
            message,
            cowTag,
            status: 'sent',
            provider: 'twilio',
            sid: responseData.sid,
            timestamp: new Date().toISOString(),
          };
          alertHistoryStore.unshift(record);

          return res.json({
            success: true,
            status: 'sent',
            provider: 'twilio',
            sid: responseData.sid,
            message: `Twilio SMS dispatched successfully to ${to}`,
            record,
          });
        } else {
          const errDetail = responseData.message || `Twilio API Error Code ${responseData.code || responseData.status}`;
          console.warn('[TWILIO API NOTICE]', errDetail, responseData.more_info || '');
          
          const failedRecord: AlertRecord = {
            id: `err-${Date.now()}`,
            to,
            message,
            cowTag,
            status: 'failed',
            provider: 'twilio',
            timestamp: new Date().toISOString(),
            error: errDetail,
          };
          alertHistoryStore.unshift(failedRecord);

          // Gracefully return device-ready fallback so app functionality is never broken
          return res.json({
            success: true,
            status: 'ready_for_device',
            provider: 'device',
            message: `Twilio API Notice: ${errDetail}. Direct mobile SMS launcher ready.`,
            twilioError: errDetail,
            smsUri: `sms:${to.replace(/[^\d+]/g, '')}?body=${encodeURIComponent(message)}`,
            record: failedRecord,
          });
        }
      } catch (twilioErr: unknown) {
        const errObj = twilioErr as Error;
        console.warn('[TWILIO NETWORK NOTICE]', errObj.message);
        const failedRecord: AlertRecord = {
          id: `err-${Date.now()}`,
          to,
          message,
          cowTag,
          status: 'failed',
          provider: 'twilio',
          timestamp: new Date().toISOString(),
          error: errObj.message || 'Failed connecting to Twilio endpoint.',
        };
        alertHistoryStore.unshift(failedRecord);
      }
    }

    // 3. Fallback when Twilio credentials are not configured or failed: Return device-ready payload
    lastAlertTimestampMap[dedupeKey] = now;
    const deviceRecord: AlertRecord = {
      id: `dev-${Date.now()}`,
      to,
      message,
      cowTag,
      status: 'ready_for_device',
      provider: 'device',
      timestamp: new Date().toISOString(),
    };
    alertHistoryStore.unshift(deviceRecord);

    return res.json({
      success: true,
      status: 'ready_for_device',
      provider: 'device',
      to,
      message: `SMS alert ready for mobile device ${to}`,
      smsUri: `sms:${to.replace(/[^\d+]/g, '')}?body=${encodeURIComponent(message)}`,
      record: deviceRecord,
    });
  } catch (error: unknown) {
    const errObj = error as Error;
    console.error('SMS API Internal Error:', errObj);
    return res.status(500).json({
      success: false,
      error: errObj.message || 'Internal server error processing SMS.',
    });
  }
});

// Serve production static build or Vite dev middleware
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HerdSentinel Server running on http://0.0.0.0:${PORT}`);
});
