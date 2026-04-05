import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/progress/me`);
      if (data.success) setProgressData(data);
    } catch (err) {
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateVideoProgress = async (courseId, videoIndex, timeSpent = 5) => {
    try {
      const { data } = await axios.post('/api/progress/update', { courseId, videoIndex, timeSpent });
      if (data.success) await fetchProgress();
      return data;
    } catch (err) {
      console.error('Update progress error:', err);
    }
  };

  const submitQuiz = async (courseId, quizId, answers, timeTaken) => {
    const { data } = await axios.post('/api/progress/quiz/submit', { courseId, quizId, answers, timeTaken });
    await fetchProgress();
    return data;
  };

  return (
    <ProgressContext.Provider value={{ progressData, loading, fetchProgress, updateVideoProgress, submitQuiz }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
export default ProgressContext;
