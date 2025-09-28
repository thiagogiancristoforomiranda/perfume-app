import React, { createContext, useState, ReactNode, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

// Interface para definir os dados que nosso contexto vai guardar
interface AuthContextData {
  signed: boolean;
  token: string | null;
  signIn(credentials: object): Promise<void>;
  signOut(): void;
  loading: boolean;
}

// Criamos o contexto com um valor inicial
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Este é o "Provedor" que vai envolver nosso App
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para fazer o login
  async function signIn(credentials: object) {
    try {
      const response = await api.post('/token/', credentials);
      const { access, refresh } = response.data;

      // Definimos o token no estado e nos headers do axios
      setToken(access);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Salvamos os tokens de forma segura
      await SecureStore.setItemAsync('userToken', access);
      await SecureStore.setItemAsync('refreshToken', refresh);
    } catch (error) {
      console.error("Falha no login", error);
      // Lançamos o erro para que a tela de login possa tratá-lo
      throw new Error("Credenciais inválidas");
    }
  }

  // Função para fazer o logout
  function signOut() {
    SecureStore.deleteItemAsync('userToken');
    SecureStore.deleteItemAsync('refreshToken');
    setToken(null);
  }

  // O valor que será compartilhado com todos os componentes filhos
  const contextValue = {
    signed: !!token,
    token,
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