// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Erro", "Por favor, preencha o usuário e a senha.");
      return;
    }
    try {
      await signIn({ username, password });
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível fazer o login. Verifique suas credenciais.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Entrar" onPress={handleLogin} />

      {/* 👇 LINK PARA A TELA DE REGISTRO ADICIONADO ABAIXO 👇 */}
      <Text style={styles.linkText} onPress={() => router.push('/register')}>
        Não tem uma conta? Crie uma agora
      </Text>

      <Text style={styles.linkText} onPress={() => router.back()}>
        Voltar para o Catálogo
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  linkText: {
    marginTop: 20,
    color: '#007BFF',
    textAlign: 'center',
    fontSize: 16,
  }
});