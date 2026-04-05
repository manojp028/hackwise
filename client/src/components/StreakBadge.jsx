import React from 'react';
import { getStreakMessage, getStreakBadgeColor } from '../utils/streakHelper';

export default function StreakBadge({ streak = 0, size = 'md' }) {
  const { text, color } = getStreakMessage(streak);
  const gradientClass = getStreakBadgeColor(streak);

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
        <span className="fire-pulse text-sm">🔥</span>
        <span className="text-sm font-bold text-orange-400">{streak}</span>
      </div>
    );
  }

  return (
    <div className="card !p-5 flex flex-col items-center gap-3 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-5`} />

      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center shadow-lg relative`}>
        <span className="text-2xl fire-pulse">🔥</span>
      </div>

      <div className="relative">
        <p className="text-3xl font-display font-bold text-white">{streak}</p>
        <p className="text-xs text-gray-400 mt-0.5">Day Streak</p>
      </div>

      <span className={`text-xs font-semibold ${color}`}>{text}</span>

      {streak > 0 && (
        <div className="flex gap-1 mt-1">
          {[...Array(Math.min(7, streak))].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full bg-gradient-to-br ${gradientClass}`} />
          ))}
        </div>
      )}
    </div>
  );
}
