import axios from 'axios';

const API = '/api/ai';

export const aiService = {
  analyzeQuiz: (payload) => axios.post(`${API}/analyze`, payload),
  getRecommendations: (payload) => axios.post(`${API}/recommend`, payload),
};

export default aiService;
