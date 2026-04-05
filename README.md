EduLearn — MERN E-Learning Platform

A full-stack e-learning app built with MongoDB, Express, React, and Node.js featuring quizzes, AI analysis, streaks, real-time challenges, and a modern UI.

Key Features
Authentication (JWT, bcrypt, protected routes)
Courses (browse, enroll, videos)
Quiz system with instant scoring
AI analysis (weak topics, study plan)
Streaks, points, badges
Real-time 1v1 challenges (Socket.io)
Dashboard (stats, graphs)
Notifications
Multi-language support (English, Hindi)
Leaderboard
Responsive design
Structure
client/   → React frontend  
server/   → Node/Express backend  
.env      → Config variables  
Setup
git clone <repo>
cd elearning-platform
npm install
cd server && npm install
cd ../client && npm install
Run
npm run dev

Frontend: http://localhost:5173

Environment Variables
MONGO_URI=...
JWT_SECRET=...
GEMINI_API_KEY=...
PORT=5000
CLIENT_URL=http://localhost:5173
API (Core)
Auth → /api/auth/*
Courses → /api/courses/*
Progress → /api/progress/*
AI → /api/ai/*
Challenge → /api/challenge/*
Tech Stack
Backend: Node.js, Express, MongoDB, Socket.io
Frontend: React, Vite, Tailwind, Axios
Build
cd client && npm run build