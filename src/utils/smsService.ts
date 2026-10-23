/**
 * Utility service to handle actual SMS dispatch to the owner's mobile device via Twilio
 */

export interface SendSMSOptions {
  recipientPhone: string;
  recipientName?: string;
  message: string;
  cowTag?: string;
  autoOpenDeviceSMS?: boolean;
  ignoreDeduplication?: boolean;
}

export interface SMSResponse {
  success: boolean;
  method: 'device_native_sms' | 'api' | 'fallback';
  status?: 'sent' | 'ready_for_device' | 'duplicate_suppressed' | 'failed';
  message: string;
  smsUri: string;
}

export interface AlertHistoryRecord {
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

/**
 * Builds standard sms: URI compatible with mobile OS (iOS/Android) and desktop SMS apps
 */
export function buildSmsUri(phone: string, body: string): string {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const encodedBody = encodeURIComponent(body);
  return `sms:${cleanPhone}?body=${encodedBody}`;
}

/**
 * Triggers actual SMS dispatch to mobile device via Twilio API or native link
 */
export async function sendActualSMS(options: SendSMSOptions): Promise<SMSResponse> {
  const { recipientPhone, message, autoOpenDeviceSMS = false, ignoreDeduplication = false } = options;
  const smsUri = buildSmsUri(recipientPhone, message);

  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientPhone,
        message,
        cowTag: options.cowTag,
        ignoreDeduplication,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      if (autoOpenDeviceSMS && typeof window !== 'undefined') {
        window.open(smsUri, '_self');
      }
      return {
        success: true,
        method: 'api',
        status: data.status,
        message: data.message || `SMS processed for ${recipientPhone}`,
        smsUri,
      };
    } else {
      console.warn('Backend Twilio SMS API reported issue:', data.error || data.message);
    }
  } catch (err) {
    console.warn('Backend SMS API endpoint unavailable:', err);
  }

  // Fallback to direct device SMS launcher
  if (autoOpenDeviceSMS && typeof window !== 'undefined') {
    window.open(smsUri, '_self');
  }

  return {
    success: true,
    method: 'device_native_sms',
    status: 'ready_for_device',
    message: `Actual SMS prepared for ${recipientPhone}`,
    smsUri,
  };
}

/**
 * Retrieves full SMS Alert History from backend
 */
export async function fetchAlertHistory(): Promise<AlertHistoryRecord[]> {
  try {
    const res = await fetch('/api/alerts');
    if (res.ok) {
      const data = await res.json();
      return data.alerts || [];
    }
  } catch (err) {
    console.error('Error fetching alert history:', err);
  }
  return [];
}

/**
 * Clears SMS Alert History on backend
 */
export async function clearAlertHistory(): Promise<boolean> {
  try {
    const res = await fetch('/api/alerts', { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Error clearing alert history:', err);
    return false;
  }
}
