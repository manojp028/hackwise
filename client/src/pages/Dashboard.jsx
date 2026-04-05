import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StreakBadge from '../components/StreakBadge';
import ProgressBar from '../components/ProgressBar';
import { WeeklyActivityGraph } from '../components/Graph';
import { courseService } from '../services/courseService';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/constants';
import { getLevelInfo } from '../utils/calculateProgress';

export default function Dashboard() {
  const { user } = useAuth();
  const { progressData, loading: progressLoading, fetchProgress } = useProgress();
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => { fetchProgress(); }, []);

  useEffect(() => {
    courseService.getCourses({ limit: 6 }).then(({ data }) => {
      if (data.success) setCourses(data.courses);
    }).catch(() => {}).finally(() => setCoursesLoading(false));
  }, []);

  const stats = progressData?.stats || {};
  const weeklyData = stats.weeklyData || [];
  const progressList = progressData?.progressList || [];
  const levelInfo = getLevelInfo(user?.points || 0);

  const statCards = [
    { label: t('dashboard.streak'), value: user?.streak?.current || 0, suffix: '🔥', color: 'text-orange-400', bg: 'from-orange-500/10 to-red-500/5' },
    { label: t('dashboard.completedCourses'), value: stats.completedCourses || 0, suffix: '📚', color: 'text-blue-400', bg: 'from-blue-500/10 to-cyan-500/5' },
    { label: t('dashboard.totalPoints'), value: user?.points || 0, suffix: '⚡', color: 'text-yellow-400', bg: 'from-yellow-500/10 to-amber-500/5' },
    { label: 'Avg Progress', value: `${stats.avgProgress || 0}%`, suffix: '📈', color: 'text-emerald-400', bg: 'from-emerald-500/10 to-teal-500/5' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 py-6 page-enter">
          {/* Welcome header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {t('dashboard.welcome')}, <span className="text-primary-400">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {user?.streak?.current > 0
                ? `You're on a ${user.streak.current}-day streak! Keep it going! 🔥`
                : "Start learning today to build your streak!"}
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {statCards.map((s, i) => (
              <div key={i} className={`card bg-gradient-to-br ${s.bg} !p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.suffix}</span>
                  <span className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Weekly graph */}
            <div className="lg:col-span-2">
              <WeeklyActivityGraph data={weeklyData} />
            </div>

            {/* Streak */}
            <StreakBadge streak={user?.streak?.current || 0} />
          </div>

          {/* In-progress courses */}
          {progressList.length > 0 && (
            <div className="mb-6">
              <h2 className="font-display font-semibold text-lg text-white mb-3">{t('dashboard.continueLearn')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {progressList.filter(p => !p.isCompleted && p.course).slice(0, 4).map((p) => (
                  <Link key={p._id} to={`/course/${p.course?._id}`} className="card flex items-center gap-4 hover:border-primary-500/30 hover:scale-[1.01] transition-all group">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      {p.course?.thumbnail
                        ? <img src={p.course.thumbnail} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-xl">
                            {CATEGORY_ICONS[p.course?.category] || '📚'}
                          </div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                        {p.course?.title}
                      </p>
                      <ProgressBar value={p.overallProgress} size="sm" showValue={false} />
                      <p className="text-xs text-gray-500 mt-1">{p.overallProgress}% complete</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recommended courses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-lg text-white">{t('dashboard.recommendedCourses')}</h2>
              <Link to="/dashboard" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all →</Link>
            </div>
            {coursesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse h-52">
                    <div className="h-28 bg-white/5 rounded-xl mb-4" />
                    <div className="h-3 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.slice(0, 6).map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const { t } = useTranslation();
  const catColor = CATEGORY_COLORS[course.category] || 'bg-gray-500/20 text-gray-300';

  return (
    <Link to={`/course/${course._id}`} className="card hover:border-primary-500/30 hover:scale-[1.02] transition-all duration-200 group flex flex-col gap-3">
      <div className="h-36 rounded-xl overflow-hidden bg-gradient-to-br from-primary-900/50 to-violet-900/30 relative">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">
              {CATEGORY_ICONS[course.category] || '📚'}
            </div>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className={`tag border ${catColor}`}>{course.category}</span>
          <span className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
            ⭐ {course.rating?.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-primary-300 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{course.instructor}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>👥 {course.enrolledCount?.toLocaleString()}</span>
        <span>⏱ {course.duration}</span>
      </div>
      <div className="btn-primary !py-2 text-center text-sm">{t('dashboard.enrollNow')}</div>
    </Link>
  );
}
