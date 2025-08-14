import axios from 'axios';

// Default to localhost for dev; Docker image sets NEXT_PUBLIC_API_URL=/api/v1
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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

// Lesson API - FIXED: Now uses correct subsection endpoint
export const getLesson = async (subsectionId: number) => {
  const response = await api.get(`/lessons/subsection/${subsectionId}`);
  return response.data;
};

// Questions API
export const getQuestions = async (sectionId: number) => {
  const response = await api.get(`/questions/section/${sectionId}`);
  return response.data;
};

export const createQuestions = async (sectionId: number, sectionTitle: string) => {
  const response = await api.post('/questions/', { 
    section_id: sectionId, 
    section_title: sectionTitle 
  });
  return response.data;
};

export const evaluateAnswer = async (questionId: number, answer: string) => {
  const response = await api.post('/questions/evaluate', { question_id: questionId, answer });
  return response.data;
};

// User API
export const registerUser = async (email: string, password: string, name: string) => {
  const response = await api.post('/auth/register', { email, password, name });
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
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

// Auth endpoints
export const loginWithGoogle = async (idToken: string) => {
  const res = await api.post('/auth/google', { id_token: idToken });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const logout = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

export default api;
