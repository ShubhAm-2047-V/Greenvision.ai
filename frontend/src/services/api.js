import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const predictCrop = async (formData) => {
  // Accepts a Multipart/form-data object containing files, lat, lon, user_id, etc.
  return apiClient.post('/api/predict/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const ocrSoil = async (file) => {
  const data = new FormData();
  data.append('image', file);
  return apiClient.post('/api/predict/ocr', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const scanLeafDisease = async (file, cropType, userId) => {
  const data = new FormData();
  data.append('image', file);
  data.append('crop_type', cropType);
  data.append('user_id', userId);
  return apiClient.post('/api/disease/scan', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const chatbotMessage = async (userId, text) => {
  return apiClient.post('/api/chat/message', { user_id: userId, message: text });
};

export const getReportUrl = async (predictionId) => {
  return apiClient.get(`/api/reports/generate/${predictionId}`);
};

// Register via backend (auto-confirms email — no email verification needed)
export const registerViaBackend = async (email, password, name, role = 'farmer') => {
  return apiClient.post('/api/auth/register', { email, password, name, role });
};

export default apiClient;
