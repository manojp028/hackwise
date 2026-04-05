const generateFallbackAnalysis = (score, totalQuestions, weakTopics, courseTitle) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  let performanceLevel = '';
  let emoji = '';

  if (percentage >= 90) { performanceLevel = 'Excellent'; emoji = '🏆'; }
  else if (percentage >= 75) { performanceLevel = 'Good'; emoji = '✅'; }
  else if (percentage >= 50) { performanceLevel = 'Average'; emoji = '📚'; }
  else { performanceLevel = 'Needs Improvement'; emoji = '💪'; }

  const weakTopicsList = weakTopics && weakTopics.length > 0
    ? weakTopics.join(', ')
    : 'Some foundational concepts';

  return `${emoji} Performance Summary: ${performanceLevel}

You scored ${score} out of ${totalQuestions} (${percentage}%) on the ${courseTitle || 'quiz'}. ${
    percentage >= 75
      ? 'Great work! You have a solid understanding of most concepts.'
      : 'There is room for improvement, and with focused practice you can significantly boost your score.'
  }

Weak Areas Identified: ${weakTopicsList} need more attention. These topics often form the foundation for more advanced concepts, so mastering them now will benefit you greatly.

Study Recommendations:
1. Revisit the video lectures covering ${weakTopicsList} - pause and take notes on key formulas and concepts.
2. Practice 10-15 problems daily on your weak topics before moving forward.
3. Use the spaced repetition technique - review the same topic after 1 day, then 3 days, then a week.
4. Join the challenge mode to test your knowledge against peers in a competitive format.

${percentage >= 75
    ? '🌟 Keep up the excellent work! Try the challenge mode to test your skills against others.'
    : '💡 Remember: Every expert was once a beginner. Consistent daily practice of even 30 minutes will show dramatic improvement within a week!'
}

Estimated improvement time: ${percentage >= 75 ? '1-2 hours' : '3-5 hours'} of focused practice on the weak topics should lead to a noticeable score increase.`;
};

const extractWeakTopics = (questions, userAnswers) => {
  const weakTopics = [];
  questions.forEach((q, i) => {
    if (userAnswers[i] !== q.correctAnswer && q.topic) {
      if (!weakTopics.includes(q.topic)) {
        weakTopics.push(q.topic);
      }
    }
  });
  return weakTopics;
};

module.exports = { generateFallbackAnalysis, extractWeakTopics };
