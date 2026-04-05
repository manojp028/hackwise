export const getStreakMessage = (streak) => {
  if (streak >= 30) return { text: 'Legendary! 🏆', color: 'text-yellow-400' };
  if (streak >= 14) return { text: 'On Fire! 🔥', color: 'text-orange-400' };
  if (streak >= 7) return { text: 'Great Streak! ⚡', color: 'text-primary-400' };
  if (streak >= 3) return { text: 'Building Momentum!', color: 'text-emerald-400' };
  if (streak >= 1) return { text: 'Just Started!', color: 'text-blue-400' };
  return { text: 'Start Your Streak!', color: 'text-gray-400' };
};

export const getStreakBadgeColor = (streak) => {
  if (streak >= 30) return 'from-yellow-500 to-amber-600';
  if (streak >= 14) return 'from-orange-500 to-red-600';
  if (streak >= 7) return 'from-primary-500 to-violet-600';
  if (streak >= 3) return 'from-emerald-500 to-teal-600';
  return 'from-blue-500 to-cyan-600';
};

export const formatStreakDays = (days) => {
  if (days === 1) return '1 day';
  return `${days} days`;
};
