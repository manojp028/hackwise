import axios from 'axios';

const API = '/api/courses';

export const courseService = {
  getCourses: (params = {}) => axios.get(API, { params }),
  getCourseById: (id) => axios.get(`${API}/${id}`),
  enrollCourse: (id) => axios.post(`${API}/${id}/enroll`),
  getQuizWithAnswers: (courseId, quizId) => axios.get(`${API}/${courseId}/quiz/${quizId}`),
};

export default courseService;
