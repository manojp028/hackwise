import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useNotification } from '../context/NotificationContext';
import { courseService } from '../services/courseService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import ProgressBar from '../components/ProgressBar';
import { CATEGORY_COLORS, CATEGORY_ICONS, LEVEL_COLORS } from '../utils/constants';

export default function CoursePage() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const { updateVideoProgress, progressData, fetchProgress } = useProgress();
  const { success, error, info } = useNotification();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [tab, setTab] = useState('videos');

  const isEnrolled = user?.enrolledCourses?.some(e => e.course?._id === id || e.course === id);
  const myProgress = progressData?.progressList?.find(p => p.course?._id === id || p.course === id);

  useEffect(() => {
    courseService.getCourseById(id)
      .then(({ data }) => { if (data.success) setCourse(data.course); })
      .catch(() => error('Failed to load course'))
      .finally(() => setLoading(false));
    fetchProgress();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data } = await courseService.enrollCourse(id);
      if (data.success) {
        success('Enrolled successfully! Start learning 🚀');
        await refreshUser();
        await fetchProgress();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Enrollment failed');
    } finally { setEnrolling(false); }
  };

  const handleVideoComplete = async (videoIndex) => {
    if (!isEnrolled) { info('Enroll in the course to track progress'); return; }
    await updateVideoProgress(id, videoIndex, 5);
    success('Progress saved! ✅');
  };

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-5xl">😕</p>
        <p className="text-gray-400">Course not found</p>
        <Link to="/dashboard" className="btn-primary">← Back to Dashboard</Link>
      </div>
    </div>
  );

  const catColor = CATEGORY_COLORS[course.category] || 'bg-gray-500/20 text-gray-300';
  const levelColor = LEVEL_COLORS[course.level] || '';

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 py-6 page-enter">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
            <Link to="/dashboard" className="hover:text-gray-300 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-300">{course.title}</span>
          </div>

          {/* Course header */}
          <div className="card mb-6 !p-0 overflow-hidden">
            <div className="relative h-48 sm:h-60">
              {course.thumbnail
                ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-primary-800 to-violet-900 flex items-center justify-center text-6xl">
                    {CATEGORY_ICONS[course.category] || '📚'}
                  </div>}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/40 to-transparent" />
            </div>
            <div className="px-6 pb-6 -mt-8 relative">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`tag border ${catColor}`}>{course.category}</span>
                <span className={`tag ${levelColor}`}>{course.level}</span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">{course.title}</h1>
              <p className="text-gray-400 text-sm mb-4 max-w-3xl">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-5">
                <span>👨‍🏫 {course.instructor}</span>
                <span>⏱ {course.duration}</span>
                <span>🎬 {course.videos?.length} videos</span>
                <span>📝 {course.quizzes?.length} quizzes</span>
                <span>👥 {course.enrolledCount?.toLocaleString()} enrolled</span>
                <span>⭐ {course.rating?.toFixed(1)}</span>
              </div>

              {isEnrolled ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 max-w-xs">
                    <ProgressBar value={myProgress?.overallProgress || 0} label="Your Progress" size="md" />
                  </div>
                  {myProgress?.isCompleted && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                      🎓 Completed!
                    </span>
                  )}
                </div>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary flex items-center gap-2">
                  {enrolling
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enrolling...</>
                    : '🚀 Enroll Now — Free'}
                </button>
              )}
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 mb-5 glass rounded-xl p-1 w-fit">
            {['videos', 'quizzes', 'about'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all
                  ${tab === t ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                {t === 'videos' ? `🎬 Videos (${course.videos?.length})` :
                 t === 'quizzes' ? `📝 Quizzes (${course.quizzes?.length})` : 'ℹ️ About'}
              </button>
            ))}
          </div>

          {/* Videos tab */}
          {tab === 'videos' && (
            !isEnrolled ? (
              <div className="card flex flex-col items-center justify-center py-16 gap-4 text-center">
                <span className="text-5xl">🔒</span>
                <h3 className="font-semibold text-white text-lg">Enroll to Access Videos</h3>
                <p className="text-gray-400 text-sm max-w-sm">Get full access to all {course.videos?.length} video lectures by enrolling in this course for free.</p>
                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary">Enroll Now — Free</button>
              </div>
            ) : (
              <VideoPlayer
                videos={course.videos}
                onComplete={handleVideoComplete}
                completedVideos={myProgress?.completedVideos || []}
              />
            )
          )}

          {/* Quizzes tab */}
          {tab === 'quizzes' && (
            <div className="flex flex-col gap-3">
              {course.quizzes?.length === 0 && (
                <div className="card text-center py-12 text-gray-400">No quizzes available yet</div>
              )}
              {course.quizzes?.map((quiz, i) => {
                const attempted = myProgress?.completedQuizzes?.find(q => q.quizId?.toString() === quiz._id?.toString());
                return (
                  <div key={quiz._id || i} className="card flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-xl">
                        📝
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{quiz.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {quiz.questions?.length} questions
                          {quiz.timeLimit && ` • ${Math.floor(quiz.timeLimit / 60)} min`}
                        </p>
                        {attempted && (
                          <p className="text-xs text-emerald-400 mt-1">
                            ✅ Best score: {attempted.score}/{attempted.totalQuestions}
                          </p>
                        )}
                      </div>
                    </div>
                    {isEnrolled ? (
                      <Link
                        to={`/quiz/${id}/${quiz._id}`}
                        className={`btn-primary !py-2 text-sm whitespace-nowrap ${attempted ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
                      >
                        {attempted ? '🔄 Retake' : '▶ Start Quiz'}
                      </Link>
                    ) : (
                      <span className="text-gray-500 text-sm">🔒 Enroll to attempt</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* About tab */}
          {tab === 'about' && (
            <div className="card max-w-3xl">
              <h3 className="font-semibold text-white mb-3">About this Course</h3>
              <p className="text-gray-400 leading-relaxed">{course.description}</p>
              {course.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {course.tags.map(tag => (
                    <span key={tag} className="tag bg-white/5 text-gray-400 border border-white/8">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
