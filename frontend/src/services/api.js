// src/services/api.js
import axios from 'axios';

// Garanta que esta linha está assim, com seu IP correto
export const API_URL = 'http://192.168.0.101:8000'; 

const api = axios.create({
  // E esta linha está montando a URL da API corretamente
  baseURL: `${API_URL}/api`,
});

export default api;