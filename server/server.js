const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketHandler');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const progressRoutes = require('./routes/progressRoutes');
const aiRoutes = require('./routes/aiRoutes');
const challengeRoutes = require('./routes/challengeRoutes');

// ✅ FIX 1: Correct dotenv path
dotenv.config();

// Create app + server
const app = express();
const server = http.createServer(app);

// ✅ FIX 2: Proper CORS setup (important for Vercel)
const CLIENT_URL = process.env.CLIENT_URL || '*';

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX 3: Socket.io CORS fix
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect DB
connectDB();

// Make io accessible
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/challenge', challengeRoutes);

// ✅ Health check (for Railway)
app.get('/', (req, res) => {
  res.send('API Running 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket init
initSocket(io);

// Error handler
app.use(errorHandler);

// ✅ FIX 4: Railway dynamic port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${CLIENT_URL}`);
});

module.exports = { app, server, io };