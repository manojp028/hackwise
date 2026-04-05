import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useNotification } from '../context/NotificationContext';
import { courseService } from '../services/courseService';
import { aiService } from '../services/aiService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ScoreRadialChart } from '../components/Graph';

const PHASE = { INTRO: 'intro', QUIZ: 'quiz', RESULT: 'result' };

export default function QuizPage() {
  const { courseId, quizId } = useParams();
  const { submitQuiz } = useProgress();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    courseService.getCourseById(courseId).then(({ data }) => {
      if (data.success) {
        setCourse(data.course);
        const q = data.course.quizzes?.find(q => q._id === quizId);
        setQuiz(q);
      }
    }).catch(() => error('Failed to load quiz')).finally(() => setLoading(false));
  }, [courseId, quizId]);

  const startQuiz = () => {
    if (!quiz) return;
    setAnswers(new Array(quiz.questions.length).fill(null));
    setTimeLeft(quiz.timeLimit || 600);
    setStartTime(Date.now());
    setPhase(PHASE.QUIZ);
  };

  useEffect(() => {
    if (phase !== PHASE.QUIZ || timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const selectAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
  };

  const goNext = () => {
    setSelected(null);
    if (current < quiz.questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    try {
      const data = await submitQuiz(courseId, quizId, answers, timeTaken);
      if (data.success) {
        setResult(data);
        setPhase(PHASE.RESULT);
        success(`Quiz submitted! Score: ${data.score}/${data.totalQuestions} 🎉`);
        fetchAiAnalysis(data);
      } else { error('Submission failed'); }
    } catch (err) { error(err.response?.data?.message || 'Submission error'); }
    finally { setSubmitting(false); }
  };

  const fetchAiAnalysis = async (resultData) => {
    setAiLoading(true);
    try {
      const { data } = await aiService.analyzeQuiz({
        courseTitle: course?.title,
        score: resultData.score,
        totalQuestions: resultData.totalQuestions,
        weakTopics: resultData.weakTopics,
        quizResults: resultData.gradedAnswers,
      });
      if (data.success) setAiAnalysis(data.analysis);
    } catch { setAiAnalysis('AI analysis unavailable. Please try again later.'); }
    finally { setAiLoading(false); }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 py-6 page-enter">

          {/* ── INTRO ─────────────────────────────────── */}
          {phase === PHASE.INTRO && quiz && (
            <div className="max-w-2xl mx-auto">
              <div className="card flex flex-col items-center text-center gap-6 py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-4xl shadow-xl">
                  📝
                </div>
                <div>
                  <h1 className="font-display font-bold text-2xl text-white mb-2">{quiz.title}</h1>
                  <p className="text-gray-400 text-sm">{course?.title}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                  {[
                    { label: 'Questions', value: quiz.questions?.length, icon: '❓' },
                    { label: 'Time Limit', value: quiz.timeLimit ? `${Math.floor(quiz.timeLimit / 60)} min` : 'None', icon: '⏱' },
                    { label: 'Points', value: `Up to ${quiz.questions?.length * 10}`, icon: '⚡' },
                  ].map((s, i) => (
                    <div key={i} className="glass rounded-xl p-3 text-center">
                      <p className="text-xl mb-1">{s.icon}</p>
                      <p className="text-white font-bold text-sm">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400 max-w-sm leading-relaxed">
                  Answer all {quiz.questions?.length} multiple-choice questions. You can review your answers before submitting. AI analysis will be provided after submission.
                </div>
                <button onClick={startQuiz} className="btn-primary px-10 text-base">
                  Start Quiz ▶
                </button>
              </div>
            </div>
          )}

          {/* ── QUIZ ──────────────────────────────────── */}
          {phase === PHASE.QUIZ && quiz && (
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Question</span>
                  <span className="font-display font-bold text-white">{current + 1}<span className="text-gray-500">/{quiz.questions.length}</span></span>
                </div>
                {timeLeft !== null && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold border
                    ${timeLeft < 60 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-gray-300 border-white/10'}`}>
                    ⏱ {formatTime(timeLeft)}
                  </div>
                )}
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5 mb-6 flex-wrap">
                {quiz.questions.map((_, i) => (
                  <div key={i} className={`flex-1 min-w-0 h-1.5 rounded-full transition-all ${i < current ? 'bg-primary-500' : i === current ? 'bg-primary-400 animate-pulse-slow' : 'bg-white/10'}`} />
                ))}
              </div>

              {/* Question card */}
              <div className="card mb-4">
                <p className="text-xs text-primary-400 font-medium mb-3">
                  {quiz.questions[current]?.topic && `📌 ${quiz.questions[current].topic}`}
                </p>
                <h2 className="text-white font-semibold text-lg leading-relaxed">
                  {quiz.questions[current]?.question}
                </h2>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3 mb-6">
                {quiz.questions[current]?.options?.map((opt, i) => {
                  let style = 'glass hover:bg-white/8 text-gray-300 hover:text-white border-white/10 cursor-pointer';
                  if (selected !== null) {
                    if (i === selected) style = 'bg-primary-600/30 text-primary-200 border-primary-500/50 cursor-default';
                    else style = 'bg-white/3 text-gray-600 border-white/5 cursor-default';
                  }
                  const letters = ['A', 'B', 'C', 'D'];
                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${style}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${selected === i ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                        {letters[i]}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {answers.filter(a => a !== null).length}/{quiz.questions.length} answered
                </div>
                <button
                  onClick={goNext}
                  disabled={selected === null || submitting}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                  ) : current < quiz.questions.length - 1 ? 'Next →' : '✓ Submit Quiz'}
                </button>
              </div>
            </div>
          )}

          {/* ── RESULT ────────────────────────────────── */}
          {phase === PHASE.RESULT && result && (
            <div className="max-w-3xl mx-auto animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-white mb-5 text-center">Quiz Results 🎯</h1>

              {/* Score card */}
              <div className="card mb-5 flex flex-col sm:flex-row items-center gap-8">
                <ScoreRadialChart score={result.score} total={result.totalQuestions} />
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Score', value: `${result.score}/${result.totalQuestions}`, color: 'text-white' },
                      { label: 'Percentage', value: `${result.percentage}%`, color: result.percentage >= 75 ? 'text-emerald-400' : result.percentage >= 50 ? 'text-amber-400' : 'text-red-400' },
                      { label: 'Correct', value: result.score, color: 'text-emerald-400' },
                      { label: 'Incorrect', value: result.totalQuestions - result.score, color: 'text-red-400' },
                    ].map((s, i) => (
                      <div key={i} className="glass rounded-xl p-3">
                        <p className="text-xs text-gray-500">{s.label}</p>
                        <p className={`text-xl font-display font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Weak topics */}
                  {result.weakTopics?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 font-medium mb-2">⚠️ Weak Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {result.weakTopics.map(t => (
                          <span key={t} className="tag bg-red-500/10 text-red-300 border border-red-500/20">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Answer review */}
              <div className="card mb-5">
                <h3 className="font-semibold text-white mb-4">Answer Review</h3>
                <div className="flex flex-col gap-3">
                  {result.gradedAnswers?.map((a, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm
                      ${a.correct ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <span className="text-base flex-shrink-0">{a.correct ? '✅' : '❌'}</span>
                      <div>
                        <p className="text-gray-300 font-medium">{quiz?.questions?.[i]?.question}</p>
                        <p className="text-xs mt-1 text-gray-500">
                          Your answer: <span className={a.correct ? 'text-emerald-400' : 'text-red-400'}>
                            {quiz?.questions?.[i]?.options?.[a.userAnswer] || 'Not answered'}
                          </span>
                          {!a.correct && <span className="text-gray-500"> • Correct: <span className="text-emerald-400">{quiz?.questions?.[i]?.options?.[a.correctAnswer]}</span></span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div className="card mb-6 border border-primary-500/20 bg-gradient-to-br from-primary-900/20 to-violet-900/10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🤖</span>
                  <h3 className="font-semibold text-white">AI Analysis</h3>
                  <span className="tag bg-primary-500/20 text-primary-300 text-xs ml-auto">Powered by Gemini</span>
                </div>
                {aiLoading ? (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Analyzing your performance...</span>
                  </div>
                ) : (
                  <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">{aiAnalysis}</pre>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to={`/course/${courseId}`} className="btn-ghost">← Back to Course</Link>
                <button onClick={() => { setPhase(PHASE.INTRO); setCurrent(0); setSelected(null); setResult(null); }} className="btn-primary">
                  🔄 Retake Quiz
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
