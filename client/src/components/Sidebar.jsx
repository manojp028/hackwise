import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLevelInfo } from '../utils/calculateProgress';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const levelInfo = getLevelInfo(user?.points || 0);

  const links = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/challenge', icon: '⚔️', label: 'Challenge' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 glass border-r border-white/5 min-h-screen p-4 gap-4 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
      {/* User card */}
      <div className="card !p-4 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{user?.name}</p>
          <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: levelInfo.color + '22', color: levelInfo.color }}>
            {levelInfo.level}
          </span>
        </div>
        <div className="w-full flex justify-between text-xs text-gray-500">
          <span>🔥 {user?.streak?.current || 0} streak</span>
          <span>⚡ {user?.points || 0} pts</span>
        </div>
        {levelInfo.next && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>XP</span>
              <span>{user?.points || 0}/{levelInfo.next}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((user?.points || 0) / levelInfo.next) * 100)}%`, background: levelInfo.color }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${location.pathname === link.path
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="card !p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Badges</p>
          <div className="flex flex-wrap gap-2">
            {user.badges.slice(0, 6).map((badge, i) => (
              <span key={i} className="text-lg" title={badge}>🏅</span>
            ))}
          </div>
        </div>
      )}

      {/* Tip of the day */}
      <div className="card !p-4 bg-gradient-to-br from-primary-900/40 to-violet-900/20">
        <p className="text-xs font-semibold text-primary-400 mb-1">💡 Daily Tip</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Consistency beats intensity. 30 minutes every day is better than 4 hours once a week.
        </p>
      </div>
    </aside>
  );
}
