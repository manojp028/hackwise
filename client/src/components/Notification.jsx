import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Notification() {
  const { user, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);

  const notifications = user?.notifications || [];
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      // optimistic update
      await axios.put('/api/auth/profile', {});
      refreshUser();
    } catch {}
  };

  const typeIcon = { streak: '🔥', course: '📚', challenge: '⚔️', system: '🔔' };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 glass-strong rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h4 className="font-semibold text-white text-sm">Notifications</h4>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  <p className="text-2xl mb-2">🔕</p>
                  <p>No notifications yet</p>
                </div>
              ) : (
                [...notifications].reverse().slice(0, 10).map((n, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors
                      ${!n.read ? 'bg-primary-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{typeIcon[n.type] || '🔔'}</span>
                      <div>
                        <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1 ml-auto" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
