import axios from 'axios';

const API = '/api/challenge';

export const challengeService = {
  startChallenge: (category) => axios.post(`${API}/start`, { category }),
  joinChallenge: (roomId) => axios.post(`${API}/join/${roomId}`),
  getActiveChallenges: () => axios.get(`${API}/active`),
  getChallengeHistory: () => axios.get(`${API}/history`),
};

export default challengeService;
