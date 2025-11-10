// app/checkout.tsx
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Alert, StatusBar, Linking } from 'react-native';
// 1. Importar 'useNavigation' e 'useLayoutEffect'
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import React, { useState, useCallback, useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';

// Paleta de cores (sem alteração)
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

// Interfaces (sem alteração)
interface CartItem {
  id: number;
  perfume: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
  quantity: number;
}
interface Address {
  id: number;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

export default function CheckoutScreen() {
  const { signed, user } = useAuth();
  const router = useRouter();
  // 2. Inicializar o hook de navegação
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);


  // 3. Adicionar este hook para esconder o cabeçalho duplicado
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // <-- ISSO ESCONDE O CABEÇALHO PADRÃO
    });
  }, [navigation]);


  // Buscar dados do carrinho e endereços (sem alteração)
  const fetchCheckoutData = async () => {
    if (!signed) return;

    try {
      setLoading(true);
      
      try {
        const cartResponse = await api.get('/cart/');
        setCartItems(cartResponse.data.items || []);
      } catch (error) {
        console.log('Erro ao buscar carrinho, usando dados mock');
        setCartItems([
          {
            id: 1,
            quantity: 2,
            perfume: {
              id: 1,
              name: 'Sauvage',
              price: '450.00',
              image: 'https://example.com/sauvage.jpg'
            }
          }
        ]);
      }

      try {
        const addressesResponse = await api.get('/addresses/');
        setAddresses(addressesResponse.data);
        const defaultAddress = addressesResponse.data.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (addressesResponse.data.length > 0) {
          setSelectedAddress(addressesResponse.data[0]);
        }
      } catch (error) {
        console.log('Erro ao buscar endereços, usando dados mock');
        const mockAddress: Address = {
          id: 1,
          name: 'Casa',
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 101',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567',
          is_default: true
        };
        setAddresses([mockAddress]);
        setSelectedAddress(mockAddress);
      }

    } catch (error) {
      console.error('Erro geral ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCheckoutData();
    }, [signed])
  );

  // Calcular totais (sem alteração)
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.perfume.price) * item.quantity);
    }, 0);
    const frete = 15.00;
    const total = subtotal + frete;
    return { subtotal, frete, total };
  };

  const { subtotal, frete, total } = calculateTotals();

  // Gerar mensagem do WhatsApp (sem alteração)
  const generateWhatsAppMessage = () => {
    if (!selectedAddress) {
      Alert.alert('Atenção', 'Selecione um endereço de entrega.');
      return;
    }
    const itemsText = cartItems.map(item => 
      `• ${item.perfume.name}\n  Quantidade: ${item.quantity}\n  Preço unitário: R$ ${parseFloat(item.perfume.price).toFixed(2)}\n  Subtotal: R$ ${(parseFloat(item.perfume.price) * item.quantity).toFixed(2)}`
    ).join('\n\n');
    const addressText = `📦 *ENDEREÇO DE ENTREGA:*\n${selectedAddress.name}\n${selectedAddress.street}, ${selectedAddress.number}${selectedAddress.complement ? `, ${selectedAddress.complement}` : ''}\n${selectedAddress.neighborhood}, ${selectedAddress.city} - ${selectedAddress.state}\nCEP: ${selectedAddress.zip_code}`;
    const message = `🛍️ *NOVO PEDIDO - PERFUMARIA LEDO*\n\n👤 *CLIENTE:*\n${user?.name || 'Cliente'}\n${user?.email || ''}\n\n📋 *ITENS DO PEDIDO:*\n${itemsText}\n\n💰 *RESUMO DO PEDIDO:*\nSubtotal: R$ ${subtotal.toFixed(2)}\nFrete: R$ ${frete.toFixed(2)}\n*TOTAL: R$ ${total.toFixed(2)}*\n\n${addressText}\n\n💬 *INFORMAÇÕES ADICIONAIS:*\nPor favor, confirme o pedido e informe as formas de pagamento disponíveis.`;
    return encodeURIComponent(message);
  };

  // Finalizar pedido via WhatsApp (sem alteração)
  const handleFinalizeOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione produtos ao carrinho antes de finalizar o pedido.');
      return;
    }
    if (!selectedAddress) {
      Alert.alert('Endereço necessário', 'Selecione um endereço de entrega.');
      return;
    }
    const phoneNumber = '5511999999999'; // <-- Lembre-se de trocar este número
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    });
  };

  // Componente de Item do Carrinho (sem alteração)
  const CartItemCard = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemCard}>
      <View style={styles.cartItemHeader}>
        <Text style={styles.perfumeName}>{item.perfume.name}</Text>
      </View>
      <View style={styles.cartItemDetails}>
        <Text style={styles.itemQuantity}>Quantidade: {item.quantity}</Text>
        <Text style={styles.itemPrice}>
          R$ {(parseFloat(item.perfume.price) * item.quantity).toFixed(2)}
        </Text>
      </View>
      <Text style={styles.unitPrice}>
        R$ {parseFloat(item.perfume.price).toFixed(2)} cada
      </Text>
    </View>
  );

  // Componente de Endereço (sem alteração)
  const AddressCard = ({ address, isSelected, onSelect }: any) => (
    <Pressable 
      style={[styles.addressCard, isSelected && styles.addressCardSelected]}
      onPress={onSelect}
    >
      <View style={styles.addressHeader}>
        <View style={styles.addressTitle}>
          <Text style={styles.addressName}>{address.name}</Text>
          {address.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>PADRÃO</Text>
            </View>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={CORES.dourado} />
        )}
      </View>
      <Text style={styles.addressText}>
        {address.street}, {address.number}
        {address.complement && `, ${address.complement}`}
      </Text>
      <Text style={styles.addressText}>
        {address.neighborhood}, {address.city} - {address.state}
      </Text>
      <Text style={styles.addressText}>CEP: {address.zip_code}</Text>
    </Pressable>
  );

  // Renderização (sem alteração)
  if (!signed) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={CORES.textoPrincipal} />
          </Pressable>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color={CORES.dourado} />
          <Text style={styles.emptyStateTitle}>Acesso não autorizado</Text>
          <Text style={styles.emptyStateText}>Faça login para finalizar sua compra</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
      
      {/* Header (este é o seu header customizado, que vai ficar) */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={CORES.textoPrincipal} />
        </Pressable>
        <Text style={styles.headerTitle}>Finalizar Pedido</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Resumo do Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={48} color={CORES.textoSecundario} />
              <Text style={styles.emptyCartText}>Seu carrinho está vazio</Text>
              <Pressable 
                style={styles.continueShoppingButton}
                onPress={() => router.push('/')}
              >
                <Text style={styles.continueShoppingText}>Continuar Comprando</Text>
              </Pressable>
            </View>
          ) : (
            cartItems.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))
          )}
        </View>

        {/* Endereço de Entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          {addresses.length === 0 ? (
            <View style={styles.emptyAddress}>
              <Ionicons name="location-outline" size={32} color={CORES.textoSecundario} />
              <Text style={styles.emptyAddressText}>Nenhum endereço cadastrado</Text>
              <Pressable 
                style={styles.addAddressButton}
                onPress={() => router.push('/address')}
              >
                <Text style={styles.addAddressText}>Cadastrar Endereço</Text>
              </Pressable>
            </View>
          ) : (
            addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddress?.id === address.id}
                onSelect={() => setSelectedAddress(address)}
              />
            ))
          )}
        </View>

        {/* Resumo de Pagamento */}
        {cartItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo de Pagamento</Text>
            <View style={styles.paymentSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frete</Text>
                <Text style={styles.summaryValue}>R$ {frete.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Informações de Pagamento */}
        {cartItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
            <View style={styles.paymentInfoCard}>
              <View style={styles.paymentHeader}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <Text style={styles.paymentTitle}>Pagamento via WhatsApp</Text>
              </View>
              <Text style={styles.paymentDescription}>
                Ao finalizar o pedido, você será redirecionado para o WhatsApp da nossa empresa para confirmar os detalhes do pedido e combinar a forma de pagamento.
              </Text>
              <View style={styles.paymentBenefits}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={CORES.sucesso} />
                  <Text style={styles.benefitText}>Pagamento seguro</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={CORES.sucesso} />
                  <Text style={styles.benefitText}>Atendimento personalizado</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color={CORES.sucesso} />
                  <Text style={styles.benefitText}>Confirmação rápida</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Espaço para o botão fixo */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Botão Fixo de Finalizar */}
      {cartItems.length > 0 && selectedAddress && (
        <View style={styles.fixedButtonContainer}>
          <Pressable 
            style={styles.finalizeButton}
            onPress={handleFinalizeOrder}
          >
            <Ionicons name="logo-whatsapp" size={24} color={CORES.botaoTexto} />
            <Text style={styles.finalizeButtonText}>FINALIZAR PEDIDO NO WHATSAPP</Text>
            <Text style={styles.finalizeButtonSubtext}>R$ {total.toFixed(2)}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

// Estilos (sem alteração)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: CORES.fundoCard,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  spacer: {
    height: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginBottom: 16,
    paddingHorizontal: 20,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
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
    paddingHorizontal: 40,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    gap: 16,
  },
  emptyCartText: {
    fontSize: 16,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  continueShoppingButton: {
    backgroundColor: CORES.dourado,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  continueShoppingText: {
    color: CORES.botaoTexto,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyAddress: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    gap: 12,
  },
  emptyAddressText: {
    fontSize: 14,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  addAddressButton: {
    borderWidth: 1,
    borderColor: CORES.dourado,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  addAddressText: {
    color: CORES.dourado,
    fontWeight: '600',
    fontSize: 12,
  },
  cartItemCard: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  cartItemHeader: {
    marginBottom: 8,
  },
  perfumeName: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginBottom: 2,
  },
  perfumeBrand: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  cartItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.dourado,
  },
  unitPrice: {
    fontSize: 12,
    color: CORES.textoSecundario,
    fontStyle: 'italic',
  },
  addressCard: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  addressCardSelected: {
    borderColor: CORES.dourado,
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: CORES.dourado,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: CORES.fundo,
  },
  addressText: {
    fontSize: 14,
    color: CORES.textoSecundario,
    marginBottom: 4,
  },
  paymentSummary: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  summaryValue: {
    fontSize: 14,
    color: CORES.textoPrincipal,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: CORES.borda,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.dourado,
  },
  paymentInfoCard: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.textoPrincipal,
  },
  paymentDescription: {
    fontSize: 14,
    color: CORES.textoSecundario,
    lineHeight: 20,
    marginBottom: 16,
  },
  paymentBenefits: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CORES.fundo,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
  },
  finalizeButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  finalizeButtonText: {
    color: CORES.botaoTexto,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  finalizeButtonSubtext: {
    color: CORES.botaoTexto,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});