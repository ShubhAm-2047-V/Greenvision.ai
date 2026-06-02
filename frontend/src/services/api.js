import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return ''; // Same-origin relative paths in production
  }
  return 'http://localhost:5000'; // Server-side or default fallback
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const predictCrop = async (payload) => {
  // Accepts a JSON payload object containing lat, lon, user_id, farm_name, image_urls list
  return apiClient.post('/api/predict/analyze', payload);
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
