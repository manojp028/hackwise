import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { challengeService } from '../services/challengeService';
import { CATEGORIES } from '../utils/constants';

const PHASE = { LOBBY: 'lobby', SEARCHING: 'searching', BATTLE: 'battle', RESULT: 'result' };

export default function ChallengePage() {
  const { user } = useAuth();
  const { success, error, info } = useNotification();
  const socketRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.LOBBY);
  const [category, setCategory] = useState('Mixed');
  const [opponent, setOpponent] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [selected, setSelected] = useState(null);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [liveAnswers, setLiveAnswers] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    challengeService.getChallengeHistory()
      .then(({ data }) => { if (data.success) setHistory(data.challenges); })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const initSocket = () => {
    if (socketRef.current) return socketRef.current;
    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('match_found', ({ roomId, players, totalQuestions: tq }) => {
      const opp = players.find(p => p.userId !== user._id);
      setOpponent(opp);
      setRoomId(roomId);
      setTotalQuestions(tq);
      setMyScore(0);
      setOppScore(0);
      setLiveAnswers([]);
      info(`⚔️ Match found! vs ${opp?.userName}`);
      setTimeout(() => setPhase(PHASE.BATTLE), 1000);
    });

    socket.on('waiting_for_opponent', () => {
      info('🔍 Looking for an opponent...');
    });

    socket.on('new_question', ({ questionIndex: qi, question: q, options, total, timeLimit }) => {
      setQuestion({ question: q, options });
      setQuestionIndex(qi);
      setTotalQuestions(total);
      setSelected(null);
      setTimeLeft(timeLimit || 15);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
      }, 1000);
    });

    socket.on('answer_received', ({ userId, playerName, correct, currentScore }) => {
      setLiveAnswers(prev => [...prev.slice(-4), { userId, playerName, correct }]);
      if (userId === user._id) setMyScore(currentScore);
      else setOppScore(currentScore);
    });

    socket.on('challenge_ended', ({ results: r, winner }) => {
      clearInterval(timerRef.current);
      setResults({ results: r, winner });
      setPhase(PHASE.RESULT);
      const me = r.find(p => p.userId === user._id);
      if (me?.isWinner) success('🏆 You won the challenge!');
      else info('Better luck next time! Keep practicing 💪');
    });

    socket.on('connect_error', () => error('Connection failed. Please try again.'));
    return socket;
  };

  const findMatch = () => {
    const socket = initSocket();
    socket.emit('find_match', { userId: user._id, userName: user.name, category });
    setPhase(PHASE.SEARCHING);
  };

  const cancelSearch = () => {
    socketRef.current?.emit('cancel_matchmaking', { userId: user._id, category });
    setPhase(PHASE.LOBBY);
  };

  const submitAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    clearInterval(timerRef.current);
    socketRef.current?.emit('submit_answer', { roomId, userId: user._id, answerIndex: idx, questionIndex });
  };

  const playAgain = () => {
    setPhase(PHASE.LOBBY);
    setOpponent(null);
    setRoomId(null);
    setQuestion(null);
    setResults(null);
    setLiveAnswers([]);
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
  };

  useEffect(() => () => { clearInterval(timerRef.current); socketRef.current?.disconnect(); }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-6 py-6 page-enter">

          {/* ── LOBBY ──────────────────────────────────── */}
          {phase === PHASE.LOBBY && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-display font-bold text-3xl text-white mb-2">⚔️ 1v1 Challenge</h1>
                <p className="text-gray-400">Battle a random opponent in a live quiz duel</p>
              </div>

              <div className="card mb-5">
                <h3 className="font-semibold text-white mb-4">Select Category</h3>
                <div className="flex flex-wrap gap-2">
                  {['Mixed', ...CATEGORIES.filter(c => c !== 'All')].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border
                        ${category === cat
                          ? 'bg-primary-600 text-white border-primary-500'
                          : 'glass text-gray-400 hover:text-white border-white/10'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: '❓', label: '10 Questions', sub: 'MCQ format' },
                  { icon: '⏱', label: '15 sec/Q', sub: 'Answer fast' },
                  { icon: '⚡', label: '10 pts/Q', sub: 'Correct answer' },
                ].map((s, i) => (
                  <div key={i} className="card !p-4 text-center">
                    <p className="text-2xl mb-1">{s.icon}</p>
                    <p className="text-white text-sm font-semibold">{s.label}</p>
                    <p className="text-gray-500 text-xs">{s.sub}</p>
                  </div>
                ))}
              </div>

              <button onClick={findMatch} className="btn-primary w-full text-base py-4">
                ⚔️ Find Opponent
              </button>

              {/* History */}
              {history.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-white mb-3">Recent Battles</h3>
                  <div className="flex flex-col gap-2">
                    {history.slice(0, 5).map((c, i) => {
                      const isWinner = c.winner?._id === user._id;
                      return (
                        <div key={i} className="card !p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-300">{c.category} · {c.players?.length} players</p>
                            <p className="text-xs text-gray-600 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`tag ${isWinner ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {isWinner ? '🏆 Won' : '😔 Lost'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SEARCHING ──────────────────────────────── */}
          {phase === PHASE.SEARCHING && (
            <div className="max-w-md mx-auto flex flex-col items-center gap-8 py-16">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-primary-900/50">
                  {user?.name?.[0]}
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary-500/30 animate-ping" />
                <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 animate-ping" style={{ animationDelay: '0.3s' }} />
              </div>
              <div className="text-center">
                <h2 className="font-display font-bold text-xl text-white mb-2">Searching for Opponent</h2>
                <p className="text-gray-400 text-sm">Category: <span className="text-primary-400">{category}</span></p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <button onClick={cancelSearch} className="btn-ghost">✕ Cancel</button>
            </div>
          )}

          {/* ── BATTLE ─────────────────────────────────── */}
          {phase === PHASE.BATTLE && question && (
            <div className="max-w-2xl mx-auto">
              {/* Score header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm">
                    {user?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">You</p>
                    <p className="text-xl font-display font-bold text-primary-400">{myScore}</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-display font-bold transition-colors ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}s
                  </div>
                  <p className="text-xs text-gray-600">{questionIndex + 1}/{totalQuestions}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{opponent?.userName || 'Opponent'}</p>
                    <p className="text-xl font-display font-bold text-orange-400">{oppScore}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-white text-sm">
                    {opponent?.userName?.[0] || 'O'}
                  </div>
                </div>
              </div>

              {/* Timer bar */}
              <div className="h-1.5 bg-white/10 rounded-full mb-5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-500' : 'bg-primary-500'}`}
                  style={{ width: `${(timeLeft / 15) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="card mb-4">
                <p className="text-xs text-primary-400 mb-2">Question {questionIndex + 1}</p>
                <h2 className="text-white font-semibold text-lg leading-relaxed">{question.question}</h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {question.options?.map((opt, i) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = selected === i;
                  return (
                    <button
                      key={i}
                      onClick={() => submitAnswer(i)}
                      disabled={selected !== null}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200
                        ${isSelected ? 'bg-primary-600/30 border-primary-500/60 text-white scale-[1.02]'
                          : selected !== null ? 'glass border-white/5 text-gray-600 cursor-not-allowed'
                          : 'glass border-white/10 text-gray-300 hover:border-primary-500/30 hover:text-white hover:scale-[1.01] cursor-pointer'}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${isSelected ? 'bg-primary-600 text-white' : 'bg-white/10 text-gray-500'}`}>
                        {letters[i]}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Live feed */}
              {liveAnswers.length > 0 && (
                <div className="flex flex-col gap-1">
                  {liveAnswers.slice(-3).map((a, i) => (
                    <p key={i} className="text-xs text-gray-600 animate-fade-in">
                      <span className="text-gray-400">{a.playerName}</span> answered {a.correct ? <span className="text-emerald-500">correctly ✓</span> : <span className="text-red-500">incorrectly ✗</span>}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RESULT ─────────────────────────────────── */}
          {phase === PHASE.RESULT && results && (
            <div className="max-w-md mx-auto animate-slide-up text-center">
              <div className="card py-10 px-6 flex flex-col items-center gap-6">
                {(() => {
                  const me = results.results?.find(p => p.userId === user._id);
                  const opp = results.results?.find(p => p.userId !== user._id);
                  const isDraw = results.results?.every(p => p.score === results.results[0].score);
                  const iWon = me?.isWinner;

                  return (
                    <>
                      <div className="text-6xl">{isDraw ? '🤝' : iWon ? '🏆' : '😔'}</div>
                      <div>
                        <h2 className="font-display font-bold text-3xl text-white">
                          {isDraw ? 'Draw!' : iWon ? 'You Won!' : 'You Lost!'}
                        </h2>
                        <p className="text-gray-400 mt-1 text-sm">
                          {iWon ? 'Excellent performance!' : 'Keep practicing and try again!'}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 w-full justify-center">
                        {results.results?.map((p, i) => {
                          const isMe = p.userId === user._id;
                          return (
                            <div key={i} className={`flex flex-col items-center gap-2 p-4 rounded-2xl flex-1
                              ${p.isWinner ? 'bg-primary-500/10 border border-primary-500/30' : 'glass'}`}>
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white
                                ${isMe ? 'bg-gradient-to-br from-primary-500 to-violet-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                                {p.name?.[0]}
                              </div>
                              <p className="text-xs text-gray-400">{isMe ? 'You' : p.name}</p>
                              <p className="text-2xl font-display font-bold text-white">{p.score}</p>
                              <p className="text-xs text-gray-500">points</p>
                              {p.isWinner && <span className="text-xs text-yellow-400">🏆 Winner</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 w-full">
                        <button onClick={playAgain} className="btn-primary flex-1">⚔️ Play Again</button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
