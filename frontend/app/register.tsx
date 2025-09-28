import React, { useState } from 'react'; // <--- Adicione o useState aqui
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from 'react-native'; // <--- Adicione o Alert aqui
import { useRouter } from 'expo-router';
import api from '../src/services/api'; // Importando nossa API

export default function RegisterScreen() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    if (!username || !password || !email) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    try {
      // Faz a chamada POST para o endpoint de registro do seu backend
      await api.post('/register/', {
        username,
        email,
        password,
      });
      Alert.alert(
        'Sucesso!',
        'Sua conta foi criada. Agora você pode fazer o login.',
        [{ text: 'OK', onPress: () => router.push('/login') }] // Leva para o login após o sucesso
      );
    } catch (error: any) {
      console.error("Falha no registro:", error.response?.data);
      let errorMessage = "Não foi possível criar a conta.";
      if (error.response?.data?.username) {
        errorMessage = `Erro no usuário: ${error.response.data.username[0]}`;
      } else if (error.response?.data?.email) {
         errorMessage = `Erro no email: ${error.response.data.email[0]}`;
      }
      Alert.alert('Erro no Registro', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Registrar" onPress={handleRegister} />

      <Text style={styles.linkText} onPress={() => router.push('/login')}>
        Já tem uma conta? Faça o login
      </Text>
    </SafeAreaView>
  );
}

// Usaremos os mesmos estilos da tela de login para manter a consistência
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