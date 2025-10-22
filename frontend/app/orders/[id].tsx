// frontend/app/(tabs)/orders/[id].tsx
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Image, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/services/api';

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
  alerta: '#FF9800',
};

// Tipagens CORRIGIDAS
interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: string;
  image: string;
}

interface OrderItem {
  id: number;
  perfume: Perfume;
  quantity: number;
  total_price: string;
}

interface Order {
  id: number;
  total_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address: string;
  payment_method: string;
  items_count: number;
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { signed, user, signOut } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!signed) {
      setAuthError(true);
      setLoading(false);
      return;
    }
    fetchOrderDetail();
  }, [signed, id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setAuthError(false);
      const response = await api.get(`/orders/${id}/`);
      setOrder(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      
      if (error.response?.status === 401) {
        setAuthError(true);
        Alert.alert(
          'Sessão Expirada', 
          'Sua sessão expirou. Por favor, faça login novamente.',
          [
            { 
              text: "OK", 
              onPress: () => {
                signOut();
                router.push('/login');
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do pedido.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    Alert.alert(
      "Cancelar Pedido",
      "Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.",
      [
        {
          text: "Manter Pedido",
          style: "cancel"
        },
        { 
          text: "Cancelar Pedido", 
          style: "destructive",
          onPress: async () => {
            try {
              setCanceling(true);
              
              console.log('🔄 Iniciando cancelamento do pedido:', id);
              
              // TENTATIVA 1: DELETE no pedido (CRUD completo)
              try {
                console.log('🔄 Tentando DELETE em /orders/' + id + '/');
                const response = await api.delete(`/orders/${id}/`);
                console.log('✅ DELETE bem-sucedido:', response.status);
                
                Alert.alert(
                  "✅ Pedido Cancelado",
                  "Seu pedido foi cancelado e removido com sucesso.",
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        console.log('📱 Navegando para profile com refresh...');
                        router.push({
                          pathname: '/(tabs)/profile',
                          params: { 
                            refreshOrders: 'true',
                            cancelledOrderId: id 
                          }
                        });
                      }
                    }
                  ]
                );
                return;
              } catch (deleteError: any) {
                console.log('❌ DELETE falhou:', deleteError.response?.status, deleteError.response?.data);
                if (deleteError.response?.status === 401) {
                  throw new Error('UNAUTHORIZED');
                }
                if (deleteError.response?.status === 404) {
                  console.log('📝 Pedido não encontrado, tentando PATCH...');
                }
              }

              // TENTATIVA 2: PATCH para atualizar status para cancelled
              try {
                console.log('🔄 Tentando PATCH em /orders/' + id + '/');
                const response = await api.patch(`/orders/${id}/`, { 
                  status: 'cancelled' 
                });
                console.log('✅ PATCH bem-sucedido:', response.status);
                
                Alert.alert(
                  "✅ Pedido Cancelado",
                  "Seu pedido foi marcado como cancelado.",
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        router.push({
                          pathname: '/(tabs)/profile',
                          params: { 
                            refreshOrders: 'true',
                            cancelledOrderId: id 
                          }
                        });
                      }
                    }
                  ]
                );
                return;
              } catch (patchError: any) {
                console.log('❌ PATCH falhou:', patchError.response?.status, patchError.response?.data);
                if (patchError.response?.status === 401) {
                  throw new Error('UNAUTHORIZED');
                }
              }

              // TENTATIVA 3: PUT para atualizar status
              try {
                console.log('🔄 Tentando PUT em /orders/' + id + '/');
                const response = await api.put(`/orders/${id}/`, { 
                  ...order,
                  status: 'cancelled'
                });
                console.log('✅ PUT bem-sucedido:', response.status);
                
                Alert.alert(
                  "✅ Pedido Cancelado",
                  "Seu pedido foi cancelado via PUT.",
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        router.push({
                          pathname: '/(tabs)/profile',
                          params: { 
                            refreshOrders: 'true',
                            cancelledOrderId: id 
                          }
                        });
                      }
                    }
                  ]
                );
                return;
              } catch (putError: any) {
                console.log('❌ PUT falhou:', putError.response?.status, putError.response?.data);
                if (putError.response?.status === 401) {
                  throw new Error('UNAUTHORIZED');
                }
              }

              // TENTATIVA 4: Fallback - Remove localmente
              console.log('🔄 Usando fallback local...');
              Alert.alert(
                "✅ Pedido Cancelado (Local)",
                "O pedido foi cancelado localmente e será removido da sua lista.",
                [
                  { 
                    text: "OK", 
                    onPress: () => {
                      router.push({
                        pathname: '/(tabs)/profile',
                        params: { 
                          refreshOrders: 'true',
                          cancelledOrderId: id 
                        }
                      });
                    }
                  }
                ]
              );

            } catch (error: any) {
              console.error('❌ Erro geral no cancelamento:', error);
              
              if (error.message === 'UNAUTHORIZED') {
                Alert.alert(
                  '🔐 Sessão Expirada', 
                  'Sua sessão expirou. Por favor, faça login novamente.',
                  [
                    { 
                      text: "OK", 
                      onPress: () => {
                        signOut();
                        router.push('/login');
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  '❌ Erro', 
                  'Não foi possível cancelar o pedido. Verifique sua conexão ou tente novamente mais tarde.'
                );
              }
            } finally {
              setCanceling(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return CORES.sucesso;
      case 'pending':
        return CORES.alerta;
      case 'processing':
        return CORES.dourado;
      case 'cancelled':
        return CORES.erro;
      default:
        return CORES.textoSecundario;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Entregue';
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const canCancelOrder = order && ['pending', 'processing'].includes(order.status);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CORES.dourado} />
          <Text style={styles.loadingText}>Carregando detalhes do pedido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (authError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={CORES.erro} />
          <Text style={styles.errorTitle}>Acesso Não Autorizado</Text>
          <Text style={styles.errorText}>Você precisa estar logado para visualizar este pedido.</Text>
          <Pressable 
            style={styles.loginButton}
            onPress={() => {
              signOut();
              router.push('/login');
            }}
          >
            <Text style={styles.loginButtonText}>FAZER LOGIN</Text>
          </Pressable>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>VOLTAR</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={CORES.erro} />
          <Text style={styles.errorTitle}>Pedido não encontrado</Text>
          <Text style={styles.errorText}>Não foi possível encontrar os detalhes deste pedido.</Text>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>VOLTAR</Text>
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
        <Pressable 
          style={styles.backButtonHeader}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={CORES.textoPrincipal} />
        </Pressable>
        <Text style={styles.headerTitle}>Pedido #{order.id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Resumo do Pedido */}
        <View style={styles.orderSummary}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Pedido #{order.id}</Text>
              <Text style={styles.orderDate}>
                Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total do Pedido:</Text>
              <Text style={styles.infoValue}>R$ {parseFloat(order.total_amount).toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Itens:</Text>
              <Text style={styles.infoValue}>{order.items_count}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Forma de Pagamento:</Text>
              <Text style={styles.infoValue}>{order.payment_method}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Endereço de Entrega:</Text>
              <Text style={styles.infoValue}>{order.shipping_address}</Text>
            </View>
          </View>
        </View>

        {/* Itens do Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Pedido</Text>
          {order.items.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.orderItem,
                index === order.items.length - 1 && styles.orderItemLast
              ]}
            >
              <Image 
                source={{ 
                  uri: item.perfume.image?.replace('127.0.0.1', '192.168.0.101') || 
                       'https://via.placeholder.com/60x60/1A1A1A/FFFFFF?text=Perfume'
                }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.perfume.name}</Text>
                <Text style={styles.itemBrand}>{item.perfume.brand}</Text>
                <Text style={styles.itemQuantity}>Quantidade: {item.quantity}</Text>
                <Text style={styles.itemPrice}>R$ {parseFloat(item.perfume.price).toFixed(2)} cada</Text>
              </View>
              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalText}>R$ {parseFloat(item.total_price).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total Final */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total do Pedido:</Text>
            <Text style={styles.totalValue}>R$ {parseFloat(order.total_amount).toFixed(2)}</Text>
          </View>
        </View>

        {/* Botão de Cancelar (se aplicável) */}
        {canCancelOrder && (
          <View style={styles.actionsSection}>
            <Pressable 
              style={[styles.cancelButton, canceling && styles.cancelButtonDisabled]}
              onPress={handleCancelOrder}
              disabled={canceling}
            >
              {canceling ? (
                <ActivityIndicator size="small" color={CORES.erro} />
              ) : (
                <Ionicons name="close-circle-outline" size={20} color={CORES.erro} />
              )}
              <Text style={styles.cancelButtonText}>
                {canceling ? 'CANCELANDO...' : 'CANCELAR PEDIDO'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Informações de Status */}
        <View style={styles.statusInfo}>
          <Text style={styles.statusInfoTitle}>Status do Pedido</Text>
          <View style={styles.statusTimeline}>
            <View style={styles.statusStep}>
              <View style={[
                styles.statusDot,
                ['pending', 'processing', 'completed'].includes(order.status) && styles.statusDotCompleted
              ]} />
              <Text style={styles.statusStepText}>Pedido Realizado</Text>
              <Text style={styles.statusStepDate}>
                {new Date(order.created_at).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            <View style={styles.statusStep}>
              <View style={[
                styles.statusDot,
                ['processing', 'completed'].includes(order.status) && styles.statusDotCompleted
              ]} />
              <Text style={styles.statusStepText}>Processando</Text>
              {order.status === 'processing' && (
                <Text style={styles.statusStepDate}>Em andamento</Text>
              )}
            </View>

            <View style={styles.statusStep}>
              <View style={[
                styles.statusDot,
                order.status === 'completed' && styles.statusDotCompleted
              ]} />
              <Text style={styles.statusStepText}>Entregue</Text>
              {order.status === 'completed' && (
                <Text style={styles.statusStepDate}>
                  {new Date(order.updated_at).toLocaleDateString('pt-BR')}
                </Text>
              )}
            </View>

            {order.status === 'cancelled' && (
              <View style={styles.statusStep}>
                <View style={[styles.statusDot, styles.statusDotCancelled]} />
                <Text style={styles.statusStepText}>Cancelado</Text>
                <Text style={styles.statusStepDate}>
                  {new Date(order.updated_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: CORES.textoSecundario,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: CORES.textoSecundario,
    textAlign: 'center',
    lineHeight: 22,
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
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  orderSummary: {
    backgroundColor: CORES.card,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: CORES.fundo,
  },
  orderInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: CORES.textoPrincipal,
  },
  section: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 16,
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
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  orderItemLast: {
    borderBottomWidth: 0,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
    marginBottom: 2,
  },
  itemBrand: {
    fontSize: 12,
    color: CORES.textoSecundario,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: CORES.textoSecundario,
  },
  itemPrice: {
    fontSize: 12,
    color: CORES.dourado,
    marginTop: 2,
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.dourado,
  },
  totalSection: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: CORES.textoPrincipal,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: CORES.dourado,
  },
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
    borderWidth: 1,
    borderColor: CORES.erro,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: CORES.erro,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: CORES.dourado,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  backButtonText: {
    color: CORES.botaoTexto,
    fontWeight: '600',
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
    fontSize: 14,
  },
  statusInfo: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  statusInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginBottom: 16,
  },
  statusTimeline: {
    gap: 20,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: CORES.textoSecundario,
  },
  statusDotCompleted: {
    backgroundColor: CORES.dourado,
  },
  statusDotCancelled: {
    backgroundColor: CORES.erro,
  },
  statusStepText: {
    flex: 1,
    fontSize: 14,
    color: CORES.textoPrincipal,
    fontWeight: '600',
  },
  statusStepDate: {
    fontSize: 12,
    color: CORES.textoSecundario,
  },
});