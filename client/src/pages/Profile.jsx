import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import StreakBadge from '../components/StreakBadge';
import { LessonsBarGraph } from '../components/Graph';
import { authService } from '../services/authService';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/constants';
import { getLevelInfo } from '../utils/calculateProgress';
import i18n from '../i18n';

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const { progressData, fetchProgress } = useProgress();
  const { success, error } = useNotification();
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', language: user?.language || 'en' });
  const [saving, setSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchProgress();
    authService.getLeaderboard()
      .then(({ data }) => { if (data.success) setLeaderboard(data.leaderboard); })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put('/api/auth/profile', form);
      if (data.success) {
        updateUser(data.user);
        if (form.language !== i18n.language) {
          i18n.changeLanguage(form.language);
          localStorage.setItem('language', form.language);
        }
        success('Profile updated! ✅');
        setEditing(false);
      }
    } catch (err) { error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const stats = progressData?.stats || {};
  const progressList = progressData?.progressList || [];
  const weeklyData = stats.weeklyData || [];
  const levelInfo = getLevelInfo(user?.points || 0);

  const myRank = leaderboard.findIndex(u => u._id === user?._id) + 1;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 py-6 page-enter">

          {/* Profile hero */}
          <div className="card mb-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-violet-900/20 to-transparent" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                {editing ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="input-field !py-2 text-lg font-semibold sm:max-w-xs"
                    />
                    <select
                      value={form.language}
                      onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
                      className="input-field !py-2 sm:max-w-32 bg-[#1a1a2e]"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={saveProfile} disabled={saving} className="btn-primary !py-2">
                        {saving ? '...' : 'Save'}
                      </button>
                      <button onClick={() => setEditing(false)} className="btn-ghost !py-2">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="font-display font-bold text-2xl text-white">{user?.name}</h1>
                      <span className="tag px-3 py-1 rounded-full font-semibold text-xs" style={{ background: levelInfo.color + '22', color: levelInfo.color }}>
                        {levelInfo.level}
                      </span>
                      {myRank > 0 && (
                        <span className="tag bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          #{myRank} on leaderboard
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                  </>
                )}
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn-ghost !py-2 text-sm flex-shrink-0">
                  ✏️ Edit
                </button>
              )}
            </div>

            {/* XP Bar */}
            {levelInfo.next && (
              <div className="relative mt-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Level Progress → {levelInfo.level}</span>
                  <span>{user?.points || 0} / {levelInfo.next} XP</span>
                </div>
                <ProgressBar
                  value={Math.min(100, ((user?.points || 0) / levelInfo.next) * 100)}
                  size="lg"
                  showValue={false}
                  color={levelInfo.color}
                />
              </div>
            )}
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Courses', value: progressList.length, icon: '📚' },
              { label: 'Completed', value: stats.completedCourses || 0, icon: '🎓' },
              { label: 'Points', value: user?.points || 0, icon: '⚡' },
              { label: 'Longest Streak', value: `${user?.streak?.longest || 0}d`, icon: '🔥' },
            ].map((s, i) => (
              <div key={i} className="card !p-4 text-center">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-xl font-display font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 mb-5 glass rounded-xl p-1 w-fit">
            {['overview', 'courses', 'leaderboard'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                  ${tab === t ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {t === 'overview' ? '📊 Overview' : t === 'courses' ? '📚 Courses' : '🏆 Leaderboard'}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StreakBadge streak={user?.streak?.current || 0} />
              <div className="card">
                <h3 className="font-semibold text-white mb-3 text-sm">Lessons This Week</h3>
                <LessonsBarGraph data={weeklyData} />
              </div>

              {/* Badges */}
              <div className="card lg:col-span-2">
                <h3 className="font-semibold text-white mb-4">Badges & Achievements</h3>
                {user?.badges?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No badges yet. Keep learning to earn your first badge! 🎖️</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {user?.badges?.map((b, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 p-3 glass rounded-xl">
                        <span className="text-2xl">🏅</span>
                        <span className="text-xs text-gray-400">{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Courses */}
          {tab === 'courses' && (
            <div className="flex flex-col gap-3">
              {progressList.length === 0 ? (
                <div className="card text-center py-12 flex flex-col items-center gap-3">
                  <span className="text-4xl">📚</span>
                  <p className="text-gray-400">You haven't enrolled in any courses yet.</p>
                  <a href="/dashboard" className="btn-primary text-sm">Explore Courses</a>
                </div>
              ) : progressList.map((p, i) => {
                const cat = p.course?.category;
                return (
                  <div key={i} className="card flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      {p.course?.thumbnail
                        ? <img src={p.course.thumbnail} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center text-2xl">
                            {CATEGORY_ICONS[cat] || '📚'}
                          </div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-white text-sm truncate">{p.course?.title}</p>
                        {p.isCompleted && <span className="tag bg-emerald-500/20 text-emerald-400 flex-shrink-0">✓ Done</span>}
                      </div>
                      {cat && <span className={`tag text-xs border mt-1 inline-block ${CATEGORY_COLORS[cat] || 'bg-gray-500/20 text-gray-300'}`}>{cat}</span>}
                      <div className="mt-2">
                        <ProgressBar value={p.overallProgress} size="sm" showValue={false} />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                        <span>{p.completedVideos?.length || 0} videos done</span>
                        <span>{p.overallProgress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Leaderboard */}
          {tab === 'leaderboard' && (
            <div className="card max-w-2xl">
              <h3 className="font-semibold text-white mb-4">🏆 Top Learners</h3>
              <div className="flex flex-col gap-2">
                {leaderboard.slice(0, 15).map((u, i) => {
                  const isMe = u._id === user?._id;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div
                      key={u._id}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all
                        ${isMe ? 'bg-primary-500/10 border border-primary-500/20' : 'glass'}`}
                    >
                      <span className="w-7 text-center font-bold text-sm text-gray-400">
                        {i < 3 ? medals[i] : `#${i + 1}`}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {u.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary-300' : 'text-white'}`}>
                          {u.name} {isMe && '(You)'}
                        </p>
                        <p className="text-xs text-gray-500">🔥 {u.streak?.current || 0} streak</p>
                      </div>
                      <span className="text-sm font-display font-bold text-yellow-400">⚡{u.points}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
