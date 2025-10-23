import { View, Text, StyleSheet, SafeAreaView, Pressable, Image, ScrollView, Alert, StatusBar, Dimensions, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';

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
  sucesso: '#4CAF50',
  erro: '#F44336',
  botaoTexto: '#000000',
};

// Tipagens
interface Order {
  id: number;
  total_amount: string;
  status: string;
  created_at: string;
  items_count: number;
}

interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: string;
  image: string;
}

interface Favorite {
  id: number;
  perfume: Perfume;
}

// Componente de Item do Menu
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

// Componente da Aba Perfil
const PerfilTab = ({ user, ordersCount, favoritesCount, onSignOut }: any) => (
  <ScrollView style={styles.tabScrollView} showsVerticalScrollIndicator={false}>
    {/* Estatísticas */}
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{ordersCount}</Text>
        <Text style={styles.statLabel}>Pedidos</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{favoritesCount}</Text>
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
        icon={<Ionicons name="location-outline" size={22} color={CORES.dourado} />}
        title="Endereços"
        subtitle="Gerencie seus endereços"
        isLast={true}
      />
    </View>

    {/* Botão de Sair */}
    <Pressable 
      style={styles.signOutButton}
      onPress={onSignOut}
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
);

// Componente da Aba Pedidos
const PedidosTab = ({ orders }: any) => (
  <ScrollView style={styles.tabScrollView} showsVerticalScrollIndicator={false}>
    {orders.length === 0 ? (
      <View style={styles.emptyState}>
        <Ionicons name="cube-outline" size={64} color={CORES.dourado} />
        <Text style={styles.emptyStateTitle}>Nenhum pedido encontrado</Text>
        <Text style={styles.emptyStateText}>Suas compras aparecerão aqui</Text>
      </View>
    ) : (
      orders.map((order: Order) => (
        <View key={order.id} style={styles.orderItem}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Pedido #{order.id}</Text>
            <Text style={[
              styles.orderStatus,
              order.status === 'completed' && styles.orderStatusCompleted,
              order.status === 'pending' && styles.orderStatusPending
            ]}>
              {order.status === 'completed' ? 'Entregue' : 
               order.status === 'pending' ? 'Pendente' : 
               order.status === 'processing' ? 'Processando' : 'Cancelado'}
            </Text>
          </View>
          <Text style={styles.orderDate}>
            {new Date(order.created_at).toLocaleDateString('pt-BR')}
          </Text>
          <Text style={styles.orderAmount}>
            R$ {parseFloat(order.total_amount).toFixed(2)}
          </Text>
          <Text style={styles.orderItems}>
            {order.items_count} {order.items_count === 1 ? 'item' : 'itens'}
          </Text>
        </View>
      ))
    )}
  </ScrollView>
);

// Componente da Aba Favoritos
const FavoritosTab = ({ favorites, router, onRefresh }: any) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (perfumeId: number) => {
    Alert.alert(
      "Remover Favorito",
      "Tem certeza que deseja remover este perfume dos favoritos?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Remover", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.post('/favorites/remove/', { perfume_id: perfumeId });
              // Atualiza a lista automaticamente
              await onRefresh();
            } catch (error) {
              console.error('Erro ao remover favorito:', error);
              Alert.alert('Erro', 'Não foi possível remover o favorito.');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.tabScrollView} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={CORES.dourado}
          colors={[CORES.dourado]}
        />
      }
    >
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={CORES.dourado} />
          <Text style={styles.emptyStateTitle}>Nenhum favorito</Text>
          <Text style={styles.emptyStateText}>Seus perfumes favoritos aparecerão aqui</Text>
        </View>
      ) : (
        favorites.map((favorite: Favorite) => (
          <Pressable 
            key={favorite.id} 
            style={styles.favoriteItem}
            onPress={() => router.push(`/perfumes/${favorite.perfume.id}`)}
          >
            <Image 
              source={{ 
                uri: favorite.perfume.image?.replace('127.0.0.1', '192.168.0.101') || 
                     'https://via.placeholder.com/50x50/1A1A1A/FFFFFF?text=Perfume'
              }}
              style={styles.favoriteImage}
            />
            <View style={styles.favoriteDetails}>
              <Text style={styles.favoriteName}>{favorite.perfume.name}</Text>
              <Text style={styles.favoriteBrand}>{favorite.perfume.brand}</Text>
              <Text style={styles.favoritePrice}>R$ {favorite.perfume.price}</Text>
            </View>
            <Pressable 
              style={styles.removeFavoriteButton}
              onPress={() => handleRemoveFavorite(favorite.perfume.id)}
            >
              <Ionicons name="heart" size={24} color={CORES.erro} />
            </Pressable>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
};

// Componente da Aba Carrinho
const CarrinhoTab = ({ cartItemsCount, router }: any) => (
  <ScrollView style={styles.tabScrollView} showsVerticalScrollIndicator={false}>
    {cartItemsCount === 0 ? (
      <View style={styles.emptyState}>
        <Ionicons name="cart-outline" size={64} color={CORES.dourado} />
        <Text style={styles.emptyStateTitle}>Carrinho vazio</Text>
        <Text style={styles.emptyStateText}>Adicione produtos ao seu carrinho</Text>
        <Pressable 
          style={styles.continueShoppingButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.continueShoppingText}>Continuar Comprando</Text>
        </Pressable>
      </View>
    ) : (
      <View style={styles.cartSummary}>
        <Text style={styles.cartSummaryTitle}>Seu carrinho tem {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'itens'}</Text>
        <Pressable 
          style={styles.viewCartButton}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.viewCartButtonText}>VER CARRINHO</Text>
        </Pressable>
      </View>
    )}
  </ScrollView>
);

export default function ProfileScreen() {
  const { signed, user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('perfil');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados do usuário
  const fetchUserData = async () => {
    if (!signed) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar pedidos
      try {
        const ordersResponse = await api.get('/orders/');
        setOrders(ordersResponse.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setOrders([]);
      }

      // Buscar favoritos
      await fetchFavorites();

      // Buscar carrinho
      try {
        const cartResponse = await api.get('/cart/');
        setCartItemsCount(cartResponse.data.total_items || 0);
      } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        setCartItemsCount(0);
      }

    } catch (error) {
      console.error('Erro geral ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função específica para buscar favoritos
  const fetchFavorites = async () => {
    if (!signed) return;
    
    try {
      const favoritesResponse = await api.get('/favorites/');
      setFavorites(favoritesResponse.data);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      setFavorites([]);
    }
  };

  // Atualizar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [signed])
  );

  // Atualizar dados quando mudar de aba
  useEffect(() => {
    if (signed && activeTab === 'favoritos') {
      fetchFavorites();
    }
  }, [activeTab, signed]);

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

  // Componente de Aba
  const TabButton = ({ tabName, icon, label, count }: any) => (
    <Pressable 
      style={[
        styles.tabButton,
        activeTab === tabName && styles.tabButtonActive
      ]}
      onPress={() => setActiveTab(tabName)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tabName ? CORES.dourado : CORES.textoSecundario} 
      />
      <Text style={[
        styles.tabLabel,
        activeTab === tabName && styles.tabLabelActive
      ]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count}</Text>
        </View>
      )}
    </Pressable>
  );

  // Conteúdo das Abas
  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return <PerfilTab user={user} ordersCount={orders.length} favoritesCount={favorites.length} onSignOut={handleSignOut} />;
      case 'pedidos':
        return <PedidosTab orders={orders} />;
      case 'favoritos':
        return <FavoritosTab 
          favorites={favorites} 
          router={router} 
          onRefresh={fetchFavorites}
        />;
      case 'carrinho':
        return <CarrinhoTab cartItemsCount={cartItemsCount} router={router} />;
      default:
        return <PerfilTab user={user} ordersCount={orders.length} favoritesCount={favorites.length} onSignOut={handleSignOut} />;
    }
  };

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

      {/* Navegação por Abas */}
      <View style={styles.tabContainer}>
        <TabButton 
          tabName="perfil" 
          icon="person" 
          label="Perfil" 
        />
        <TabButton 
          tabName="pedidos" 
          icon="cube" 
          label="Pedidos" 
          count={orders.length}
        />
        <TabButton 
          tabName="favoritos" 
          icon="heart" 
          label="Favoritos" 
          count={favorites.length}
        />
        <TabButton 
          tabName="carrinho" 
          icon="cart" 
          label="Carrinho" 
          count={cartItemsCount}
        />
      </View>

      {/* Conteúdo da Aba Selecionada */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
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
  // Navegação por Abas
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: CORES.fundoCard,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: CORES.dourado,
  },
  tabLabel: {
    fontSize: 12,
    color: CORES.textoSecundario,
    marginTop: 4,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: CORES.dourado,
  },
  tabBadge: {
    position: 'absolute',
    top: 12,
    right: 20,
    backgroundColor: CORES.dourado,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: CORES.fundo,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  tabScrollView: {
    flex: 1,
  },
  // Estatísticas
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
  // Menu
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
  // Estados Vazios
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  // Pedidos
  orderItem: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    color: CORES.dourado,
  },
  orderStatusCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    color: CORES.sucesso,
  },
  orderStatusPending: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    color: '#FFC107',
  },
  orderDate: {
    fontSize: 14,
    color: CORES.textoSecundario,
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.dourado,
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 12,
    color: CORES.textoSecundario,
  },
  // Favoritos
  favoriteItem: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CORES.borda,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  favoriteDetails: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
    marginBottom: 2,
  },
  favoriteBrand: {
    fontSize: 12,
    color: CORES.textoSecundario,
    marginBottom: 4,
  },
  favoritePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: CORES.dourado,
  },
  removeFavoriteButton: {
    padding: 8,
  },
  // Carrinho
  cartSummary: {
    backgroundColor: CORES.card,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    alignItems: 'center',
  },
  cartSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
    marginBottom: 16,
    textAlign: 'center',
  },
  viewCartButton: {
    backgroundColor: CORES.dourado,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  viewCartButtonText: {
    color: CORES.botaoTexto,
    fontWeight: '600',
    fontSize: 14,
  },
  continueShoppingButton: {
    backgroundColor: CORES.dourado,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  continueShoppingText: {
    color: CORES.botaoTexto,
    fontWeight: '600',
    fontSize: 14,
  },
  // Botão Sair
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