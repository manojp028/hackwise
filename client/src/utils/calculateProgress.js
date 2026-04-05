export const calculateCourseProgress = (progress, course) => {
  if (!progress || !course) return 0;
  const totalItems = (course.videos?.length || 0) + (course.quizzes?.length || 0);
  if (totalItems === 0) return 0;
  const completedItems = (progress.completedVideos?.length || 0) + (progress.completedQuizzes?.length || 0);
  return Math.min(100, Math.round((completedItems / totalItems) * 100));
};

export const calculateOverallProgress = (progressList) => {
  if (!progressList || progressList.length === 0) return 0;
  const total = progressList.reduce((sum, p) => sum + (p.overallProgress || 0), 0);
  return Math.round(total / progressList.length);
};

export const getProgressColor = (pct) => {
  if (pct >= 80) return '#10b981'; // emerald
  if (pct >= 50) return '#6366f1'; // primary
  if (pct >= 25) return '#f97316'; // orange
  return '#6b7280'; // gray
};

export const getLevelInfo = (points) => {
  if (points >= 5000) return { level: 'Master', next: null, color: '#f59e0b' };
  if (points >= 2000) return { level: 'Expert', next: 5000, color: '#8b5cf6' };
  if (points >= 800) return { level: 'Advanced', next: 2000, color: '#6366f1' };
  if (points >= 200) return { level: 'Intermediate', next: 800, color: '#10b981' };
  return { level: 'Beginner', next: 200, color: '#3b82f6' };
};
