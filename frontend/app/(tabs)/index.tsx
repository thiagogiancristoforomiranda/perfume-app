import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, FlatList, SafeAreaView,
    ActivityIndicator, Alert, Pressable, StatusBar, Image,
    Animated, Easing, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

interface Perfume {
  id: number;
  name?: string;
  brand?: string;
  price: string;
}

// Paleta de cores sofisticada dourado e preto
const CORES = {
  fundo: '#000000',
  fundoCard: '#0A0A0A',
  card: '#1A1A1A',
  cardHover: '#252525',
  textoPrincipal: '#FFFFFF',
  textoSecundario: '#B0B0B0',
  dourado: '#FFD700',
  douradoSuave: '#FFE55C',
  douradoEscuro: '#B8860B',
  borda: '#2A2A2A',
};

export default function HomeScreen() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [perfumesFiltrados, setPerfumesFiltrados] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [modoPesquisa, setModoPesquisa] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const searchAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();

  // Função para buscar os dados
  async function fetchPerfumes() {
    try {
      setLoading(true);
      const response = await api.get('/perfumes');
      setPerfumes(response.data);
      setPerfumesFiltrados(response.data);
    } catch (error) {
      console.error('Erro ao buscar perfumes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os perfumes.');
    } finally {
      setLoading(false);
    }
  }

  // Função de pesquisa
  const handlePesquisa = (texto: string) => {
    setPesquisa(texto);
    
    if (texto.trim() === '') {
      setPerfumesFiltrados(perfumes);
    } else {
      const filtrado = perfumes.filter(perfume => 
        perfume.name?.toLowerCase().includes(texto.toLowerCase()) ||
        perfume.brand?.toLowerCase().includes(texto.toLowerCase())
      );
      setPerfumesFiltrados(filtrado);
    }
  };

  // Alternar modo pesquisa
  const togglePesquisa = () => {
    if (modoPesquisa) {
      // Fechar pesquisa
      setPesquisa('');
      setPerfumesFiltrados(perfumes);
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setModoPesquisa(false));
    } else {
      // Abrir pesquisa
      setModoPesquisa(true);
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // Animação de entrada
  useEffect(() => {
    fetchPerfumes();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  // Função para navegar para o perfil
  const handleProfilePress = () => {
    router.push('/profile');
  };

  // Componente de card de perfume com animação
  const PerfumeCard = ({ item, index }: { item: Perfume; index: number }) => {
    const [scaleValue] = useState(new Animated.Value(1));
    
    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Link
        href={{ pathname: "/perfumes/[id]", params: { id: item.id } }}
        asChild
      >
        <Pressable 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View 
            style={[
              styles.itemContainer,
              {
                transform: [{ scale: scaleValue }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>{item.name ?? 'Perfume Exclusivo'}</Text>
                
                {/* Rating stars */}
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons 
                      key={star} 
                      name="star" 
                      size={14} 
                      color={CORES.dourado} 
                    />
                  ))}
                </View>
              </View>
              
              <View style={styles.priceContainer}>
                <Text style={styles.itemPrice}>R$ {item.price}</Text>
                <View style={styles.buyButton}>
                  <Ionicons name="arrow-forward" size={16} color={CORES.fundo} />
                </View>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Link>
    );
  };

  // Largura animada do campo de pesquisa
  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '70%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />

      {/* Header Moderno */}
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0]
            }) }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          {!modoPesquisa && (
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
          )}
          
          <View style={styles.headerIcons}>
            {/* Campo de Pesquisa Animado */}
            <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
              {modoPesquisa && (
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar perfumes..."
                  placeholderTextColor={CORES.textoSecundario}
                  value={pesquisa}
                  onChangeText={handlePesquisa}
                  autoFocus={true}
                  selectionColor={CORES.dourado}
                />
              )}
            </Animated.View>

            {/* Botão de Pesquisa */}
            <Pressable 
              style={[
                styles.iconButton, 
                modoPesquisa && styles.iconButtonActive
              ]} 
              onPress={togglePesquisa}
            >
              <Ionicons 
                name={modoPesquisa ? "close" : "search"} 
                size={24} 
                color={modoPesquisa ? CORES.dourado : CORES.textoPrincipal} 
              />
            </Pressable>

            {/* Botão do Perfil */}
            {!modoPesquisa && (
              <Pressable 
                style={styles.iconButton} 
                onPress={handleProfilePress}
              >
                <Ionicons name="person" size={24} color={CORES.textoPrincipal} />
              </Pressable>
            )}
          </View>
        </View>
        
        {/* Subtítulo elegante - esconder durante pesquisa */}
        {!modoPesquisa && (
          <Text style={styles.subtitle}>Perfumaria Ledo - desde 1950</Text>
        )}
      </Animated.View>

      {/* Indicador de pesquisa ativa */}
      {modoPesquisa && pesquisa !== '' && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            {perfumesFiltrados.length} perfume{perfumesFiltrados.length !== 1 ? 's' : ''} encontrado{perfumesFiltrados.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Conteúdo Principal */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={CORES.dourado} />
            <Text style={styles.loadingText}>Carregando coleção...</Text>
          </View>
        ) : (
          <FlatList
            data={perfumesFiltrados}
            renderItem={({ item, index }) => <PerfumeCard item={item} index={index} />}
            keyExtractor={(item, index) => item?.id?.toString() ?? `item-${index}`}
            refreshing={loading}
            onRefresh={fetchPerfumes}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name={pesquisa ? "search-outline" : "rose-outline"} 
                  size={64} 
                  color={CORES.dourado} 
                />
                <Text style={styles.emptyListText}>
                  {pesquisa ? 'Nenhum perfume encontrado' : 'Nenhum perfume encontrado'}
                </Text>
                <Text style={styles.emptyListSubtext}>
                  {pesquisa ? 'Tente outros termos de busca' : 'Nossa coleção está sendo atualizada'}
                </Text>
              </View>
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: CORES.fundo,
  },
  content: {
    flex: 1,
  },
  // Header Estilizado
  headerContainer: {
    backgroundColor: CORES.fundoCard,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Estilos da Pesquisa
  searchContainer: {
    overflow: 'hidden',
  },
  searchInput: {
    backgroundColor: CORES.card,
    color: CORES.textoPrincipal,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: CORES.dourado,
  },
  searchInfo: {
    backgroundColor: CORES.dourado,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  searchInfoText: {
    color: CORES.fundo,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: CORES.card,
  },
  iconButtonActive: {
    backgroundColor: CORES.dourado,
  },
  subtitle: {
    color: CORES.dourado,
    fontSize: 14,
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '300',
  },
  // Lista e Cards
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  itemContainer: {
    backgroundColor: CORES.card,
    borderRadius: 20,
    marginVertical: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTextContainer: { 
    flex: 1, 
    marginRight: 15,
  },
  itemName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: CORES.textoPrincipal, 
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  itemPrice: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: CORES.dourado,
    letterSpacing: 0.5,
  },
  buyButton: {
    backgroundColor: CORES.dourado,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Estados de Loading e Vazio
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyListText: { 
    color: CORES.textoPrincipal, 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: '600',
  },
  emptyListSubtext: { 
    color: CORES.textoSecundario, 
    textAlign: 'center', 
    fontSize: 14,
  },
});