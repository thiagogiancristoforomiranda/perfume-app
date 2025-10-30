// src/services/api.js
import axios from 'axios';
import { Platform } from 'react-native'; // Importamos 'Platform' para detectar se é web ou mobile

// --- CONFIGURAÇÃO DE AMBIENTE ---

// 1. URL de Produção (O seu servidor no Render)
const PROD_API_URL = 'https://perfume-app-backend-kc2d.onrender.com';

// 2. URLs de Desenvolvimento
const DEV_MOBILE_API_URL = 'http://192.168.0.101:8000'; // IP para Emulador Android
const DEV_WEB_API_URL = 'http://127.0.0.1:8000'; // IP para Web (localhost)
// Lembrete: Se for usar o celular físico, use seu IP de rede (ex: 'http://192.168.0.101:8000')

// 3. Verifica se estamos em modo de desenvolvimento
const isDevelopment = __DEV__;

// 4. Escolhe a URL de desenvolvimento correta baseado na plataforma
let devUrl;
if (Platform.OS === 'web') {
  devUrl = DEV_WEB_API_URL;
  console.log("Rodando na WEB, usando API em:", devUrl);
} else {
  devUrl = DEV_MOBILE_API_URL;
  console.log("Rodando no MOBILE, usando API em:", devUrl);
}

// 5. Define a URL base final
export const API_URL = isDevelopment ? devUrl : PROD_API_URL;

// ----------------------------------

const api = axios.create({
  // Monta a URL da API (ex: http://127.0.0.1:8000/api)
  baseURL: `${API_URL}/api`,
});

// Interceptor simples para adicionar token (Seu código estava ótimo)
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