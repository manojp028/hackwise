import axios from 'axios';

// ✅ Use environment variable (Vercel)
const API_BASE = import.meta.env.VITE_API_URL;

// ✅ Full API path
const API = `${API_BASE}/api/auth`;

export const authService = {
  login: (email, password) =>
    axios.post(`${API}/login`, { email, password }),

  register: (name, email, password) =>
    axios.post(`${API}/register`, { name, email, password }),

  getMe: () =>
    axios.get(`${API}/me`),

  updateProfile: (updates) =>
    axios.put(`${API}/profile`, updates),

  getLeaderboard: () =>
    axios.get(`${API}/leaderboard`),
};

export default authService;