const User = require('../models/User');

const sendNotification = async (userId, message, type = 'system') => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          message,
          type,
          read: false,
          createdAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
};

const sendStreakReminder = async (userId, streakDays) => {
  await sendNotification(
    userId,
    `🔥 You're on a ${streakDays}-day streak! Keep it up to maintain your momentum!`,
    'streak'
  );
};

const sendChallengeNotification = async (userId, challengerName) => {
  await sendNotification(
    userId,
    `⚔️ ${challengerName} has challenged you to a quiz battle! Accept the challenge now!`,
    'challenge'
  );
};

const sendCourseCompleteNotification = async (userId, courseTitle) => {
  await sendNotification(
    userId,
    `🎉 Congratulations! You completed "${courseTitle}"! Your certificate is ready.`,
    'course'
  );
};

module.exports = {
  sendNotification,
  sendStreakReminder,
  sendChallengeNotification,
  sendCourseCompleteNotification
};
