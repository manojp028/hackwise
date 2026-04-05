const User = require('../models/User');

const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = user.streak.lastActiveDate
      ? new Date(user.streak.lastActiveDate)
      : null;

    if (lastActive) {
      const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      const diffMs = today - lastActiveDay;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return; // Already active today
      if (diffDays === 1) {
        user.streak.current += 1;
        if (user.streak.current > user.streak.longest) {
          user.streak.longest = user.streak.current;
        }
        // Award points for streak milestones
        if (user.streak.current % 7 === 0) {
          user.points += 50;
          if (!user.badges.includes(`streak_${user.streak.current}`)) {
            user.badges.push(`streak_${user.streak.current}`);
          }
        } else {
          user.points += 5;
        }
      } else {
        // Missed a day - reset streak
        user.streak.current = 1;
      }
    } else {
      user.streak.current = 1;
      user.streak.longest = Math.max(1, user.streak.longest);
    }

    user.streak.lastActiveDate = now;
    await user.save();

    return user.streak;
  } catch (error) {
    console.error('Streak update error:', error);
  }
};

module.exports = { updateStreak };
