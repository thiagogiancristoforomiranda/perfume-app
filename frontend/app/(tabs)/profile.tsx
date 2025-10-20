import { View, Text, StyleSheet, SafeAreaView, Pressable, Image, ScrollView, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

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
  sucesso: '#4CAF50',
  erro: '#F44336',
  botaoTexto: '#000000',
};

export default function ProfileScreen() {
  const { signed, user, signOut, token } = useAuth();
  const router = useRouter();

  const handleLoginPress = () => {
    router.push('/login');
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Sair", 
          onPress: signOut,
          style: "destructive"
        }
      ]
    );
  };

  // Função para obter o nome de exibição
  const getDisplayName = () => {
    if (!user) return 'Usuário';
    return user.name || user.username || 'Usuário';
  };

  // Função para obter a primeira letra do avatar
  const getAvatarLetter = () => {
    const letter = getDisplayName().charAt(0).toUpperCase();
    return letter;
  };

  const MenuItem = ({ icon, title, subtitle, onPress, isLast = false }: any) => (
    <Pressable 
      style={[styles.menuItem, isLast && styles.menuItemLast]} 
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          {icon}
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={CORES.textoSecundario} />
    </Pressable>
  );

  if (!signed) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={CORES.dourado} />
              </View>
            </View>
            <Text style={styles.welcomeTitle}>Bem-vindo à Perfumaria Ledo</Text>
            <Text style={styles.welcomeSubtitle}>Faça login para acessar sua conta</Text>
          </View>

          {/* Botão de Login */}
          <Pressable 
            style={styles.loginButton}
            onPress={handleLoginPress}
          >
            <Ionicons name="log-in-outline" size={24} color={CORES.botaoTexto} />
            <Text style={styles.loginButtonText}>FAZER LOGIN</Text>
          </Pressable>

          {/* Benefícios */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Vantagens de ter uma conta</Text>
            
            <View style={styles.benefitItem}>
              <Ionicons name="cart-outline" size={20} color={CORES.dourado} />
              <Text style={styles.benefitText}>Acompanhe seus pedidos</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="heart-outline" size={20} color={CORES.dourado} />
              <Text style={styles.benefitText}>Salve seus favoritos</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color={CORES.dourado} />
              <Text style={styles.benefitText}>Finalize a compra</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Usuário logado
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header do Perfil */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getAvatarLetter()}
              </Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={CORES.dourado} />
            </View>
          </View>
          
          <Text style={styles.userName}>{getDisplayName()}</Text>
          
          <View style={styles.memberSince}>
            <Ionicons name="calendar-outline" size={14} color={CORES.textoSecundario} />
            <Text style={styles.memberSinceText}>Membro desde 2024</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Pedidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
        </View>

        {/* Menu de Opções */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Minha Conta</Text>
          
          <MenuItem
            icon={<Ionicons name="person-outline" size={22} color={CORES.dourado} />}
            title="Meus Dados"
            subtitle="Gerencie suas informações"
          />
          
          <MenuItem
            icon={<Ionicons name="cube-outline" size={22} color={CORES.dourado} />}
            title="Meus Pedidos"
            subtitle="Acompanhe suas compras"
          />
          
          <MenuItem
            icon={<Ionicons name="heart-outline" size={22} color={CORES.dourado} />}
            title="Favoritos"
            subtitle="Seus perfumes preferidos"
          />
          
          <MenuItem
            icon={<Ionicons name="location-outline" size={22} color={CORES.dourado} />}
            title="Endereços"
            subtitle="Gerencie seus endereços"
          />
        </View>

        {/* Mais Opções */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Mais</Text>
          
          <MenuItem
            icon={<Ionicons name="help-circle-outline" size={22} color={CORES.dourado} />}
            title="Ajuda & Suporte"
            subtitle="Central de ajuda"
            isLast={true}
          />
        </View>

        {/* Botão de Sair */}
        <Pressable 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={CORES.erro} />
          <Text style={styles.signOutText}>SAIR DA CONTA</Text>
        </Pressable>

        {/* Versão do App */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Perfumaria Ledo</Text>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: CORES.fundoCard,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CORES.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CORES.dourado,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CORES.dourado,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CORES.dourado,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CORES.fundo,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: CORES.fundo,
    borderRadius: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CORES.textoPrincipal,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CORES.textoPrincipal,
    marginBottom: 12,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberSinceText: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  loginButton: {
    backgroundColor: CORES.dourado,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: CORES.botaoTexto,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  benefitsSection: {
    backgroundColor: CORES.card,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: CORES.card,
    margin: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORES.dourado,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: CORES.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: CORES.borda,
  },
  menuSection: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: CORES.textoSecundario,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
    borderWidth: 1,
    borderColor: CORES.erro,
  },
  signOutText: {
    color: CORES.erro,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    color: CORES.textoSecundario,
  },
});