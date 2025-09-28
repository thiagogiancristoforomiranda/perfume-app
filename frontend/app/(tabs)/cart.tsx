import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

// Tipagens para os dados do carrinho
interface CartItem {
  id: number;
  perfume: {
    name: string;
    price: string;
  };
  quantity: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
}

export default function CartScreen() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { signed } = useAuth();

  const fetchCart = async () => {
    if (!signed) {
      setCart(null); // Limpa o carrinho se o usuário deslogar
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

  // useFocusEffect roda toda vez que o usuário NAVEGA para esta tela, mantendo-a atualizada
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [signed])
  );

  // ===== FUNÇÃO DE CHECKOUT ATUALIZADA =====
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert("Erro", "Seu carrinho está vazio.");
      return;
    }

    try {
      // Faz a chamada POST para o endpoint de checkout do backend
      const response = await api.post('/checkout/', {
        // Dados de exemplo, pois a API os exige. Em um app real,
        // o usuário preencheria um formulário com essas informações.
        shipping_address: "Rua do Cliente, 123, Bairro Exemplo, Cidade Teste",
        payment_method: "Cartão de Crédito"
      });

      Alert.alert(
        "Pedido Realizado!",
        `Seu pedido #${response.data.order_id} foi criado com sucesso.`,
        // Após o alerta, a função fetchCart é chamada para atualizar a tela
        [{ text: 'OK', onPress: () => fetchCart() }] 
      );
    } catch (error) {
      console.error("Erro ao finalizar a compra:", error);
      Alert.alert("Erro", "Não foi possível finalizar a compra.");
    }
  };

  if (!signed) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>Você precisa fazer o login para ver seu carrinho.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>Seu carrinho está vazio.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.perfume.name} (x{item.quantity})</Text>
            <Text style={styles.itemPrice}>R$ {parseFloat(item.perfume.price) * item.quantity}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.totalText}>Total: R$ {cart.total_price}</Text>
            <Button title="Finalizar Compra" onPress={handleCheckout} />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoText: { fontSize: 18, color: 'gray', textAlign: 'center' },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },
  footer: {
    marginTop: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  }
});