import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl px-4 py-3 text-xs shadow-xl">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WeeklyActivityGraph({ data = [] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">Weekly Activity</h3>
        <span className="tag bg-primary-500/10 text-primary-400 border border-primary-500/20">Last 7 days</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="minutesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#6366f1" strokeWidth={2} fill="url(#minutesGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LessonsBarGraph({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="lessons" name="Lessons" fill="#f97316" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ScoreRadialChart({ score, total }) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#6366f1' : '#f97316';
  const data = [{ name: 'Score', value: pct }, { name: 'Remaining', value: 100 - pct }];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${pct * 2.51} 251`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold text-white">{pct}%</span>
          <span className="text-xs text-gray-500">Score</span>
        </div>
      </div>
      <p className="text-sm font-semibold" style={{ color }}>{score}/{total} Correct</p>
    </div>
  );
}

export default WeeklyActivityGraph;
