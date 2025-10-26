// src/services/api.js
import axios from 'axios';

// Garanta que esta linha está assim, com seu IP correto
export const API_URL = 'https://perfume-app-backend-kc2d.onrender.com';

const api = axios.create({
  // E esta linha está montando a URL da API corretamente
  baseURL: `${API_URL}/api`,
});

// Interceptor simples para adicionar token
api.interceptors.request.use(
  async (config) => {
    try {
      // Importação condicional para evitar erros
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.default.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('AsyncStorage não disponível ou token não encontrado');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;