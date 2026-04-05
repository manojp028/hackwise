const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    score: { type: Number, default: 0 },
    answers: [{ questionIndex: Number, answer: Number, correct: Boolean, timeMs: Number }],
    isReady: { type: Boolean, default: false },
    isConnected: { type: Boolean, default: true }
  }],
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    topic: String
  }],
  category: { type: String, default: 'Mixed' },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed'],
    default: 'waiting'
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startedAt: { type: Date },
  endedAt: { type: Date },
  currentQuestion: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
