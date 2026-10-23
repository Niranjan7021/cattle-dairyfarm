import React, { useEffect, useState } from 'react';
import { MessageSquare, X, ArrowUpRight, Phone, CheckCheck } from 'lucide-react';
import { NotificationAlert } from '../types';

interface SMSAlertToastProps {
  notification: NotificationAlert | null;
  onClose: () => void;
  onViewCow?: (tag: string) => void;
}

export const SMSAlertToast: React.FC<SMSAlertToastProps> = ({
  notification,
  onClose,
  onViewCow,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 7000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification]);

  if (!notification || !visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full transition-all duration-300 transform translate-y-0 opacity-100">
      <div className="bg-[#18231e] border border-[#2d4338] text-neutral-100 rounded-xl shadow-2xl p-4 overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d4338]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>SMS Dispatched</span>
                <span className="text-neutral-500">·</span>
                <span className="text-neutral-400 font-mono-numbers">{notification.recipientPhone}</span>
              </div>
              <p className="text-xs text-neutral-400">Recipient: {notification.recipientName}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 200);
            }}
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SMS Bubble */}
        <div className="mt-3 bg-[#0f1714] p-3 rounded-lg border border-[#23352c] text-sm">
          <div className="font-semibold text-neutral-200 text-xs mb-1 flex items-center justify-between">
            <span>{notification.title}</span>
            <span className="text-[11px] text-neutral-500 font-mono-numbers">{notification.timestamp}</span>
          </div>
          <p className="text-neutral-300 text-xs leading-relaxed">{notification.message}</p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1 text-emerald-400/90 font-mono-numbers">
              <CheckCheck className="w-3.5 h-3.5" /> Delivered to carrier
            </span>
            <span>Ref: Cow #{notification.cowTag}</span>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#2d4338]/40">
          <a
            href={`tel:${notification.recipientPhone}`}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-[#22332a] hover:bg-[#2c4237] transition-colors"
          >
            <Phone className="w-3.5 h-3.5" /> Call Mobile
          </a>

          {onViewCow && notification.cowTag && (
            <button
              onClick={() => {
                onViewCow(notification.cowTag);
                setVisible(false);
              }}
              className="flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200 font-medium px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors"
            >
              Inspect Cow #{notification.cowTag} <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
