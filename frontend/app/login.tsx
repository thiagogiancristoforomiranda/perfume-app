// app/login.tsx
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
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Erro", "Por favor, preencha o usuário e a senha.");
      return;
    }

    setLoading(true);
    try {
      await signIn({ username, password });
      Alert.alert('🎉 Sucesso!', 'Login realizado com sucesso!');
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('❌ Erro', 'Não foi possível fazer o login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <Text style={styles.subtitle}>Perfumaria Ledo - desde 1950</Text>
        </View>

        {/* Card de Login */}
        <View style={styles.loginCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.welcomeTitle}>Bem-vindo de volta</Text>
            <Text style={styles.welcomeSubtitle}>Faça login em sua conta</Text>
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

            {/* Esqueci a senha */}
            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </Pressable>

            {/* Botão de Login */}
            <Pressable 
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
                loading && styles.loginButtonDisabled
              ]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Ionicons name="refresh" size={20} color={CORES.botaoTexto} />
              ) : (
                <Ionicons name="log-in-outline" size={20} color={CORES.botaoTexto} />
              )}
              <Text style={styles.loginButtonText}>
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </Text>
            </Pressable>
          </View>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Criar conta */}
          <Pressable 
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <Ionicons name="person-add-outline" size={20} color={CORES.dourado} />
            <Text style={styles.registerButtonText}>CRIAR UMA CONTA</Text>
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
    marginBottom: 40,
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
  loginCard: {
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -10,
  },
  forgotPasswordText: {
    color: CORES.dourado,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
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
  loginButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
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
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: CORES.dourado,
    gap: 12,
  },
  registerButtonText: {
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