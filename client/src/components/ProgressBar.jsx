import React from 'react';
import { getProgressColor } from '../utils/calculateProgress';

export default function ProgressBar({ value = 0, label, showValue = true, size = 'md', color }) {
  const pct = Math.min(100, Math.max(0, value));
  const barColor = color || getProgressColor(pct);

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const height = heights[size] || heights.md;

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-xs font-medium text-gray-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-bold" style={{ color: barColor }}>{pct}%</span>
          )}
        </div>
      )}
      <div className={`w-full ${height} bg-white/10 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}aa, ${barColor})` }}
        >
          {size === 'lg' && pct > 10 && (
            <div className="absolute inset-0 bg-white/20 rounded-full"
              style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)' }} />
          )}
        </div>
      </div>
    </div>
  );
}
