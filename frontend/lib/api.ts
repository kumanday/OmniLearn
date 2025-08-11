import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Knowledge Tree API
export const createKnowledgeTree = async (topic: string) => {
  const response = await api.post('/knowledge-tree/', { topic });
  return response.data;
};

export const getKnowledgeTree = async (treeId: number) => {
  const response = await api.get(`/knowledge-tree/${treeId}`);
  return response.data;
};

// Lesson API
export const getLesson = async (subsectionId: number) => {
  const response = await api.get(`/lessons/${subsectionId}`);
  return response.data;
};

// Questions API
export const getQuestions = async (sectionId: number) => {
  const response = await api.get(`/questions/section/${sectionId}`);
  return response.data;
};

export const evaluateAnswer = async (questionId: number, answer: string) => {
  const response = await api.post(`/questions/${questionId}/evaluate`, { answer });
  return response.data;
};

// User API
export const registerUser = async (email: string, password: string, name: string) => {
  const response = await api.post('/users/register', { email, password, name });
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/users/login', { email, password });
  return response.data;
};

export const getUserProgress = async () => {
  const response = await api.get('/users/progress');
  return response.data;
};

export const updateUserProgress = async (subsectionId: number, score: number) => {
  const response = await api.post('/users/progress', { subsection_id: subsectionId, score });
  return response.data;
};

// Set auth token for API requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;