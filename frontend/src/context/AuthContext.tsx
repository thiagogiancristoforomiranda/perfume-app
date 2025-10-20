import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

// Interface para o usuário
interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
}

// Interface para definir os dados que nosso contexto vai guardar
interface AuthContextData {
  signed: boolean;
  token: string | null;
  user: User | null;
  signIn(credentials: { username: string; password: string }): Promise<void>;
  signOut(): void;
  loading: boolean;
}

// Criamos o contexto com um valor inicial
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Este é o "Provedor" que vai envolver nosso App
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega o token e dados do usuário ao iniciar o app
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        const storedUser = await SecureStore.getItemAsync('userData');
        
        console.log('🔍 Loading from storage:');
        console.log('storedToken:', storedToken ? 'EXISTS' : 'NULL');
        console.log('storedUser:', storedUser ? 'EXISTS' : 'NULL');
        
        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do storage:', error);
      } finally {
        setLoading(false);
        console.log('✅ AuthContext loading finished');
      }
    }

    loadStorageData();
  }, []);

  // Função para fazer o login
  async function signIn(credentials: { username: string; password: string }) {
    try {
      setLoading(true);
      console.log('🔐 Starting login for:', credentials.username);
      
      const response = await api.post('/token/', credentials);
      const { access, refresh } = response.data;

      console.log('✅ Login successful, fetching user data...');

      // Configura o token para a próxima requisição
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // Tenta buscar os dados reais do usuário
      let userData: User;
      try {
        const userResponse = await api.get('/user/profile/');
        userData = userResponse.data;
        console.log('✅ Real user data fetched:', userData);
      } catch (userError) {
        console.log('⚠️ Could not fetch user data, using fallback');
        // Fallback: cria usuário básico
        userData = {
          id: Date.now(),
          username: credentials.username,
          email: `${credentials.username}@perfumarialedo.com`,
          name: credentials.username.charAt(0).toUpperCase() + credentials.username.slice(1)
        };
      }

      // Define os dados no estado
      setToken(access);
      setUser(userData);
      
      // Salva no SecureStore
      await SecureStore.setItemAsync('userToken', access);
      await SecureStore.setItemAsync('refreshToken', refresh);
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      
      console.log('💾 Data saved to SecureStore');
      
    } catch (error) {
      console.error("❌ Falha no login", error);
      throw new Error("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  // Função para fazer o logout
  async function signOut() {
    try {
      console.log('🚪 Signing out...');
      
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userData');
      
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      
      console.log('✅ Sign out completed');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  }

  // O valor que será compartilhado com todos os componentes filhos
  const contextValue = {
    signed: !!token,
    token,
    user,
    signIn,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto em outras telas
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}