import axios from 'axios';

const getBaseUrl = () => {
  return ''; // Always use relative paths for Next.js App Router API routes
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds timeout to allow long AI/external API processing
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

export const chatbotMessage = async (userId, text, locale = 'en') => {
  return apiClient.post('/api/chat', { user_id: userId, message: text, locale });
};

export const getReportUrl = async (predictionId) => {
  return apiClient.get(`/api/reports/generate/${predictionId}`);
};

// Register via backend (auto-confirms email — no email verification needed)
export const registerViaBackend = async (email, password, name, role = 'farmer') => {
  return apiClient.post('/api/auth/register', { email, password, name, role });
};

export default apiClient;
