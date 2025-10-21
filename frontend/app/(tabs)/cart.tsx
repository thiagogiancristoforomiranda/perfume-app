import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, 
  SafeAreaView, Pressable, Image, StatusBar, Animated, Dimensions 
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

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
  sucesso: '#4CAF50',
  erro: '#F44336',
};

// Tipagens para os dados do carrinho
interface CartItem {
  id: number;
  perfume: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
  quantity: number;
  total_price: string;
}

interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
  total_items: number;
}

export default function CartScreen() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<number[]>([]);
  const { signed } = useAuth();
  const router = useRouter();

  const fetchCart = async () => {
    if (!signed) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/cart/');
      setCart(response.data);
    } catch (error) {
      console.error("Erro ao buscar o carrinho:", error);
      Alert.alert("Erro", "Não foi possível carregar o carrinho.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [signed])
  );

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setUpdatingItems(prev => [...prev, itemId]);
    try {
      if (newQuantity === 0) {
        await api.post('/cart/remove/', { item_id: itemId });
      } else {
        await api.post('/cart/update/', { 
          item_id: itemId, 
          quantity: newQuantity 
        });
      }
      await fetchCart();
    } catch (error) {
      console.error("Erro ao atualizar carrinho:", error);
      Alert.alert("Erro", "Não foi possível atualizar o item.");
    } finally {
      setUpdatingItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const removeItem = async (itemId: number) => {
    Alert.alert(
      "Remover Item",
      "Tem certeza que deseja remover este item do carrinho?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive",
          onPress: async () => {
            setUpdatingItems(prev => [...prev, itemId]);
            try {
              await api.post('/cart/remove/', { item_id: itemId });
              await fetchCart();
            } catch (error) {
              console.error("Erro ao remover item:", error);
              Alert.alert("Erro", "Não foi possível remover o item.");
            } finally {
              setUpdatingItems(prev => prev.filter(id => id !== itemId));
            }
          }
        }
      ]
    );
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert("Carrinho Vazio", "Seu carrinho está vazio.");
      return;
    }

    try {
      const response = await api.post('/checkout/', {
        shipping_address: "Endereço do usuário",
        payment_method: "Cartão de Crédito"
      });

      Alert.alert(
        "🎉 Pedido Realizado!",
        `Seu pedido #${response.data.order_id} foi criado com sucesso.`,
        [{ text: 'OK', onPress: () => fetchCart() }]
      );
    } catch (error) {
      console.error("Erro ao finalizar a compra:", error);
      Alert.alert("Erro", "Não foi possível finalizar a compra.");
    }
  };

  const CartItemComponent = ({ item }: { item: CartItem }) => (
    <Animated.View style={styles.itemContainer}>
      <Image 
        source={{ uri: item.perfume.image.replace('127.0.0.1', '192.168.0.101') }}
        style={styles.itemImage}
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.perfume.name}</Text>
        <Text style={styles.itemPrice}>R$ {parseFloat(item.perfume.price).toFixed(2)}</Text>
        
        <View style={styles.quantityContainer}>
          <Pressable 
            style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={updatingItems.includes(item.id) || item.quantity <= 1}
          >
            <Ionicons 
              name="remove" 
              size={16} 
              color={item.quantity <= 1 ? CORES.textoSecundario : CORES.textoPrincipal} 
            />
          </Pressable>
          
          <View style={styles.quantityDisplay}>
            {updatingItems.includes(item.id) ? (
              <ActivityIndicator size="small" color={CORES.dourado} />
            ) : (
              <Text style={styles.quantityText}>{item.quantity}</Text>
            )}
          </View>
          
          <Pressable 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={updatingItems.includes(item.id)}
          >
            <Ionicons name="add" size={16} color={CORES.textoPrincipal} />
          </Pressable>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          R$ {parseFloat(item.total_price).toFixed(2)}
        </Text>
        <Pressable 
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
          disabled={updatingItems.includes(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={CORES.erro} />
        </Pressable>
      </View>
    </Animated.View>
  );

  if (!signed) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        <View style={styles.centerContainer}>
          <Ionicons name="cart-outline" size={64} color={CORES.dourado} />
          <Text style={styles.infoTitle}>Carrinho Vazio</Text>
          <Text style={styles.infoText}>Faça login para acessar seu carrinho</Text>
          <Pressable 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={CORES.dourado} />
          <Text style={styles.loadingText}>Carregando carrinho...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        <View style={styles.centerContainer}>
          <Ionicons name="cart-outline" size={64} color={CORES.dourado} />
          <Text style={styles.infoTitle}>Carrinho Vazio</Text>
          <Text style={styles.infoText}>Adicione alguns produtos incríveis ao seu carrinho</Text>
          <Pressable 
            style={styles.continueShoppingButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.continueShoppingText}>Continuar Comprando</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
        <Text style={styles.headerSubtitle}>{cart.total_items} itens</Text>
      </View>

      {/* Lista de Itens */}
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CartItemComponent item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer com Total e Checkout */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>R$ {parseFloat(cart.total_price).toFixed(2)}</Text>
        </View>
        
        <Pressable 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Ionicons name="card-outline" size={20} color={CORES.botaoTexto} />
          <Text style={styles.checkoutButtonText}>FINALIZAR COMPRA</Text>
        </Pressable>
        
        <Pressable 
          style={styles.continueShoppingButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.continueShoppingText}>Continuar Comprando</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: CORES.textoSecundario,
    textAlign: 'center',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: CORES.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CORES.borda,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    gap: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
  },
  itemPrice: {
    fontSize: 14,
    color: CORES.dourado,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: CORES.fundoCard,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    color: CORES.textoPrincipal,
    fontWeight: '600',
    fontSize: 16,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.dourado,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  footer: {
    backgroundColor: CORES.fundoCard,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    gap: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    color: CORES.textoPrincipal,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: CORES.dourado,
  },
  checkoutButton: {
    backgroundColor: CORES.dourado,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButtonText: {
    color: CORES.botaoTexto,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  continueShoppingButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueShoppingText: {
    color: CORES.textoSecundario,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: CORES.dourado,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 16,
  },
  loginButtonText: {
    color: CORES.botaoTexto,
    fontWeight: '600',
    fontSize: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: CORES.textoSecundario,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    color: CORES.textoSecundario,
    fontSize: 16,
    marginTop: 12,
  },
});