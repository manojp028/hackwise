const Challenge = require('../models/Challenge');
const User = require('../models/User');

const waitingQueue = new Map(); // category -> [{ socketId, userId, userName }]
const activeRooms = new Map(); // roomId -> { players, currentQuestion, timer, answers }

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Matchmaking
    socket.on('find_match', async ({ userId, userName, category }) => {
      const cat = category || 'Mixed';
      if (!waitingQueue.has(cat)) waitingQueue.set(cat, []);

      const queue = waitingQueue.get(cat);
      const existing = queue.find(p => p.userId === userId);
      if (existing) return;

      const opponent = queue.shift();

      if (opponent) {
        // Match found!
        const roomId = `room_${Date.now()}`;
        socket.join(roomId);
        io.sockets.sockets.get(opponent.socketId)?.join(roomId);

        // Load questions
        const Challenge = require('../models/Challenge');
        const Course = require('../models/Course');
        const courses = await Course.find({ isPublished: true }).limit(5);
        const questions = [];
        courses.forEach(c => {
          c.quizzes.forEach(q => q.questions.forEach(ques => {
            questions.push({ question: ques.question, options: ques.options, correctAnswer: ques.correctAnswer, topic: ques.topic });
          }));
        });
        const selectedQs = questions.sort(() => Math.random() - 0.5).slice(0, 10);

        activeRooms.set(roomId, {
          players: {
            [userId]: { socketId: socket.id, name: userName, score: 0, answers: [] },
            [opponent.userId]: { socketId: opponent.socketId, name: opponent.userName, score: 0, answers: [] }
          },
          questions: selectedQs,
          currentQuestion: 0,
          answersThisRound: {}
        });

        const matchData = {
          roomId,
          players: [
            { userId, userName },
            { userId: opponent.userId, userName: opponent.userName }
          ],
          totalQuestions: selectedQs.length
        };

        io.to(roomId).emit('match_found', matchData);

        // Start first question after 3s
        setTimeout(() => sendQuestion(io, roomId), 3000);
      } else {
        queue.push({ socketId: socket.id, userId, userName });
        socket.emit('waiting_for_opponent', { message: 'Looking for an opponent...' });
      }
    });

    // Player answers
    socket.on('submit_answer', ({ roomId, userId, answerIndex, questionIndex }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;

      const player = room.players[userId];
      if (!player) return;

      // Prevent double answer
      if (room.answersThisRound[userId] !== undefined) return;

      room.answersThisRound[userId] = answerIndex;
      const question = room.questions[questionIndex];
      const correct = answerIndex === question.correctAnswer;

      if (correct) {
        player.score += 10;
      }

      player.answers.push({ questionIndex, answer: answerIndex, correct });

      // Notify both players
      io.to(roomId).emit('answer_received', {
        userId,
        playerName: player.name,
        correct,
        currentScore: player.score
      });

      // If both answered, move next
      const playerIds = Object.keys(room.players);
      if (Object.keys(room.answersThisRound).length >= playerIds.length) {
        room.answersThisRound = {};
        room.currentQuestion += 1;

        if (room.currentQuestion >= room.questions.length) {
          endChallenge(io, roomId, room);
        } else {
          setTimeout(() => sendQuestion(io, roomId), 2000);
        }
      }
    });

    // Cancel matchmaking
    socket.on('cancel_matchmaking', ({ userId, category }) => {
      const cat = category || 'Mixed';
      const queue = waitingQueue.get(cat) || [];
      const idx = queue.findIndex(p => p.userId === userId);
      if (idx !== -1) queue.splice(idx, 1);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Remove from waiting queues
      waitingQueue.forEach((queue, cat) => {
        const idx = queue.findIndex(p => p.socketId === socket.id);
        if (idx !== -1) queue.splice(idx, 1);
      });
    });
  });
};

const sendQuestion = (io, roomId) => {
  const room = activeRooms.get(roomId);
  if (!room) return;

  const q = room.questions[room.currentQuestion];
  if (!q) return;

  io.to(roomId).emit('new_question', {
    questionIndex: room.currentQuestion,
    question: q.question,
    options: q.options,
    total: room.questions.length,
    timeLimit: 15
  });

  // Auto-advance after 15s if no answers
  setTimeout(() => {
    const currentRoom = activeRooms.get(roomId);
    if (!currentRoom) return;
    if (currentRoom.currentQuestion === room.currentQuestion) {
      currentRoom.answersThisRound = {};
      currentRoom.currentQuestion += 1;
      if (currentRoom.currentQuestion >= currentRoom.questions.length) {
        endChallenge(io, roomId, currentRoom);
      } else {
        sendQuestion(io, roomId);
      }
    }
  }, 16000);
};

const endChallenge = (io, roomId, room) => {
  const players = Object.entries(room.players);
  let winner = null;
  let maxScore = -1;

  players.forEach(([uid, p]) => {
    if (p.score > maxScore) {
      maxScore = p.score;
      winner = { userId: uid, name: p.name, score: p.score };
    }
  });

  const results = players.map(([uid, p]) => ({
    userId: uid,
    name: p.name,
    score: p.score,
    isWinner: uid === winner?.userId
  }));

  io.to(roomId).emit('challenge_ended', { results, winner });
  activeRooms.delete(roomId);
};

module.exports = { initSocket };
