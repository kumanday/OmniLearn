// @ts-nocheck
import axios from 'axios';

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

// Lesson API
export const createLesson = async (subsectionId: number, subsectionTitle: string) => {
  const response = await api.post('/lessons/', { subsection_id: subsectionId, subsection_title: subsectionTitle });
  return response.data;
};

export const getLesson = async (subsectionId: number) => {
  const response = await api.get(`/lessons/subsection/${subsectionId}`);
  return response.data;
};

export const getLessonBySubsection = async (subsectionId: number) => {
  const response = await api.get(`/lessons/subsection/${subsectionId}`);
  return response.data;
};

// Questions API
export const createQuestions = async (sectionId: number, sectionTitle: string, difficulty?: string) => {
  const response = await api.post('/questions/', { 
    section_id: sectionId, 
    section_title: sectionTitle,
    difficulty: difficulty || 'medium'
  });
  return response.data;
};

export const getQuestionsBySection = async (sectionId: number, difficulty?: string) => {
  const url = difficulty 
    ? `/questions/section/${sectionId}?difficulty=${difficulty}`
    : `/questions/section/${sectionId}`;
  const response = await api.get(url);
  return response.data;
};

export const evaluateAnswer = async (questionId: number, answer: string) => {
  const response = await api.post('/questions/evaluate', { 
    question_id: questionId, 
    answer 
  });
  return response.data;
};

// User API
export const createUser = async (email: string, name: string, password: string) => {
  const response = await api.post('/users/', { email, name, password });
  return response.data;
};

export const getUser = async (userId: number) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProgress = async (userId: number, subsectionId: number, completed: boolean, score?: number) => {
  const response = await api.post(`/users/${userId}/progress`, { 
    subsection_id: subsectionId, 
    completed,
    score
  });
  return response.data;
};

export const getUserProgress = async (userId: number) => {
  const response = await api.get(`/users/${userId}/progress`);
  return response.data;
};

// Auth helpers
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

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