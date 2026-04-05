import axios from 'axios';

const API = '/api/progress';

export const progressService = {
  updateProgress: (courseId, videoIndex, timeSpent) =>
    axios.post(`${API}/update`, { courseId, videoIndex, timeSpent }),
  getUserProgress: (userId = 'me') => axios.get(`${API}/${userId}`),
  submitQuiz: (courseId, quizId, answers, timeTaken) =>
    axios.post(`${API}/quiz/submit`, { courseId, quizId, answers, timeTaken }),
};

export default progressService;
