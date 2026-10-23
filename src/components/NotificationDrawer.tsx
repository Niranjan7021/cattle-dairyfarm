import React from 'react';
import { X, MessageSquare, Phone, CheckCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { NotificationAlert } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationAlert[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectCow: (tag: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectCow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="bg-[#121a16] border-l border-[#273a30] text-neutral-100 max-w-md w-full h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#23332b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Mobile SMS Notification Log</h3>
              <p className="text-[11px] text-neutral-400">Direct carrier dispatches to farmer & vet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action strip */}
        <div className="px-4 py-2 border-b border-[#23332b] bg-[#0c120f] flex items-center justify-between text-xs text-neutral-400">
          <span>{notifications.length} Total Messages Dispatched</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllRead}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Mark all read
            </button>
            <span className="text-neutral-600">·</span>
            <button
              onClick={onClearAll}
              className="hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear log
            </button>
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border transition-colors ${
                notif.priority === 'high'
                  ? 'bg-[#181a17] border-rose-900/60'
                  : notif.type === 'estrus_filter'
                  ? 'bg-[#16161c] border-violet-900/60'
                  : 'bg-[#141f19] border-[#25392e]'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-semibold text-emerald-400 font-mono-numbers">
                  TO: {notif.recipientPhone}
                </span>
                <span className="text-neutral-500 font-mono-numbers">{notif.timestamp}</span>
              </div>

              <div className="font-bold text-xs text-white mb-1">{notif.title}</div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-2.5">{notif.message}</p>

              <div className="pt-2 border-t border-[#23332b] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-emerald-400/90 font-mono-numbers">
                  <CheckCheck className="w-3.5 h-3.5" /> Delivered to Carrier
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${notif.recipientPhone}`}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  {notif.cowTag && (
                    <button
                      onClick={() => {
                        onSelectCow(notif.cowTag);
                        onClose();
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      Cow #{notif.cowTag}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No notifications dispatched yet. Record milk production or trigger a priority check to send an SMS!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
