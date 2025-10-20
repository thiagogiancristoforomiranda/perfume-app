// app/register.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  Pressable, 
  StatusBar, 
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../src/services/api';
import { Ionicons } from '@expo/vector-icons';

// Paleta de cores sofisticada
const CORES = {
  fundo: '#000000',
  fundoCard: '#0A0A0A',
  card: '#1A1A1A',
  textoPrincipal: '#FFFFFF',
  textoSecundario: '#B0B0B0',
  dourado: '#FFD700',
  douradoSuave: '#FFE55C',
  douradoEscuro: '#B8860B',
  borda: '#2A2A2A',
  botaoTexto: '#000000',
  erro: '#F44336',
  sucesso: '#4CAF50',
};

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !password || !email || !confirmPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/register/', {
        username,
        email,
        password,
      });
      Alert.alert(
        '🎉 Sucesso!',
        'Sua conta foi criada com sucesso!',
        [{ text: 'FAZER LOGIN', onPress: () => router.push('/login') }]
      );
    } catch (error: any) {
      console.error("Falha no registro:", error.response?.data);
      let errorMessage = "Não foi possível criar a conta.";
      if (error.response?.data?.username) {
        errorMessage = `Erro no usuário: ${error.response.data.username[0]}`;
      } else if (error.response?.data?.email) {
        errorMessage = `Erro no email: ${error.response.data.email[0]}`;
      } else if (error.response?.data?.password) {
        errorMessage = `Erro na senha: ${error.response.data.password[0]}`;
      }
      Alert.alert('❌ Erro no Registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com Logo */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.subtitle}>Junte-se à nossa família</Text>
        </View>

        {/* Card de Registro */}
        <View style={styles.registerCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.welcomeTitle}>Criar Conta</Text>
            <Text style={styles.welcomeSubtitle}>Preencha seus dados para se registrar</Text>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>
            {/* Campo Usuário */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="person-outline" size={20} color={CORES.dourado} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nome de usuário"
                placeholderTextColor={CORES.textoSecundario}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Campo Email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="mail-outline" size={20} color={CORES.dourado} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={CORES.textoSecundario}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Campo Senha */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed-outline" size={20} color={CORES.dourado} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={CORES.textoSecundario}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable 
                style={styles.eyeIcon}
                onPress={togglePasswordVisibility}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={CORES.textoSecundario} 
                />
              </Pressable>
            </View>

            {/* Campo Confirmar Senha */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Ionicons name="lock-closed-outline" size={20} color={CORES.dourado} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Confirmar Senha"
                placeholderTextColor={CORES.textoSecundario}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable 
                style={styles.eyeIcon}
                onPress={toggleConfirmPasswordVisibility}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={CORES.textoSecundario} 
                />
              </Pressable>
            </View>

            {/* Requisitos da Senha */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Sua senha deve conter:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                  size={14} 
                  color={password.length >= 6 ? CORES.sucesso : CORES.textoSecundario} 
                />
                <Text style={[
                  styles.requirementText,
                  password.length >= 6 && styles.requirementMet
                ]}>
                  Pelo menos 6 caracteres
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={password === confirmPassword && password !== '' ? "checkmark-circle" : "ellipse-outline"} 
                  size={14} 
                  color={password === confirmPassword && password !== '' ? CORES.sucesso : CORES.textoSecundario} 
                />
                <Text style={[
                  styles.requirementText,
                  password === confirmPassword && password !== '' && styles.requirementMet
                ]}>
                  Senhas coincidem
                </Text>
              </View>
            </View>

            {/* Botão de Registro */}
            <Pressable 
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.registerButtonPressed,
                loading && styles.registerButtonDisabled
              ]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <Ionicons name="refresh" size={20} color={CORES.botaoTexto} />
              ) : (
                <Ionicons name="person-add-outline" size={20} color={CORES.botaoTexto} />
              )}
              <Text style={styles.registerButtonText}>
                {loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
              </Text>
            </Pressable>
          </View>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Fazer Login */}
          <Pressable 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="log-in-outline" size={20} color={CORES.dourado} />
            <Text style={styles.loginButtonText}>FAZER LOGIN</Text>
          </Pressable>
        </View>

        {/* Voltar ao catálogo */}
        <Pressable 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="arrow-back-outline" size={16} color={CORES.dourado} />
          <Text style={styles.backButtonText}>Voltar para o Catálogo</Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Perfumaria Ledo</Text>
          <Text style={styles.footerText}>Tradição e qualidade desde 1950</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  subtitle: {
    color: CORES.dourado,
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
  },
  registerCard: {
    backgroundColor: CORES.card,
    borderRadius: 25,
    padding: 30,
    borderWidth: 1,
    borderColor: CORES.borda,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CORES.textoPrincipal,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.fundoCard,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: CORES.borda,
    height: 60,
  },
  inputIcon: {
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: CORES.textoPrincipal,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  passwordRequirements: {
    backgroundColor: CORES.fundoCard,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  requirementsTitle: {
    color: CORES.textoSecundario,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requirementText: {
    color: CORES.textoSecundario,
    fontSize: 12,
  },
  requirementMet: {
    color: CORES.sucesso,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: CORES.dourado,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 15,
    gap: 12,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
  },
  registerButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: CORES.botaoTexto,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: CORES.borda,
  },
  dividerText: {
    color: CORES.textoSecundario,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: CORES.dourado,
    gap: 12,
  },
  loginButtonText: {
    color: CORES.dourado,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButtonText: {
    color: CORES.dourado,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: CORES.textoSecundario,
    fontSize: 12,
    marginBottom: 4,
  },
});