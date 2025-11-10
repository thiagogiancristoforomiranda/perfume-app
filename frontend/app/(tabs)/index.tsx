import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, FlatList, SafeAreaView,
    ActivityIndicator, Alert, Pressable, StatusBar, Image,
    Animated, Easing, TextInput, Dimensions, Platform // Adicionado Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../src/services/api'; // Importar API_URL

// --- CORREÇÃO 1: Interface ---
// 'brand' removido, 'image_url' corrigido para 'image'
interface Perfume {
  id: number;
  name?: string;
  price: string;
  image?: string | null; 
}
// --- FIM DA CORREÇÃO ---

// Paleta de cores
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

const { width: screenWidth } = Dimensions.get('window');

// URL do seu backend no Render
const BACKEND_URL = 'https://perfume-app-backend-kc2d.onrender.com';

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
      const response = await api.get('/perfumes/');
      setPerfumes(response.data);
      setPerfumesFiltrados(response.data);
    } catch (error) {
      console.error('Erro ao buscar perfumes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os perfumes.');
      setPerfumes([]);
      setPerfumesFiltrados([]);
    } finally {
      setLoading(false);
    }
  }

  // --- CORREÇÃO 2: Pesquisa ---
  // Removida a lógica de busca pelo 'brand'
  const handlePesquisa = (texto: string) => {
    setPesquisa(texto);
    
    if (texto.trim() === '') {
      setPerfumesFiltrados(perfumes);
    } else {
      const filtrado = perfumes.filter(perfume => 
        perfume.name?.toLowerCase().includes(texto.toLowerCase())
      );
      setPerfumesFiltrados(filtrado);
    }
  };
  // --- FIM DA CORREÇÃO ---

  // Alternar modo pesquisa
  const togglePesquisa = () => {
    if (modoPesquisa) {
      setPesquisa('');
      setPerfumesFiltrados(perfumes);
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setModoPesquisa(false));
    } else {
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

  // --- CORREÇÃO 3: Componente do Card ---
  const PerfumeCard = ({ item, index }: { item: Perfume; index: number }) => {
    const [scaleValue] = useState(new Animated.Value(1));
    const [imageError, setImageError] = useState(false);
    
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

    let imageUrl: string | null = null;
    
    if (item.image && !imageError) {
      if (Platform.OS === 'web') {
        // Na web, o backend já envia a URL completa do Render
        imageUrl = item.image;
      } else {
        // No mobile (Expo Go), precisamos trocar o '127.0.0.1' pelo IP da rede
        // Assumindo que API_URL está definido como 'http://SEU_IP:8000/api'
        const baseURL = API_URL.replace('/api', ''); 
        // Se a imagem já for a URL completa do Render, não faz nada
        if (item.image.startsWith('http')) {
          imageUrl = item.image;
        } else {
          // Se for caminho local (ex: /media/...), constrói a URL local
          imageUrl = `${baseURL}${item.image}`;
        }
      }
    }

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
              <View style={styles.imageContainer}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.perfumeImage}
                    onError={() => setImageError(true)}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="flower-outline" size={32} color={CORES.dourado} />
                  </View>
                )}
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name ?? 'Perfume Exclusivo'}
                  </Text>
                  
                  {/* Bloco 'brand' removido daqui */}
                  
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
            </View>
          </Animated.View>
        </Pressable>
      </Link>
    );
  };
  // --- FIM DA CORREÇÃO ---

  // O resto do seu arquivo continua igual...
  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '70%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />

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
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
              />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Perfumaria</Text>
                <Text style={styles.subtitleMain}>LEDO</Text>
              </View>
            </View>
          )}
          
          <View style={styles.headerIcons}>
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
        
        {!modoPesquisa && (
          <Text style={styles.legacyText}>desde 1950</Text>
        )}
      </Animated.View>

      {modoPesquisa && pesquisa !== '' && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            {perfumesFiltrados.length} perfume{perfumesFiltrados.length !== 1 ? 's' : ''} encontrado{perfumesFiltrados.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

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
  headerContainer: {
    backgroundColor: CORES.fundoCard,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    color: CORES.textoPrincipal,
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 1,
  },
  subtitleMain: {
    color: CORES.dourado,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
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
  legacyText: {
    color: CORES.textoSecundario,
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '300',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  itemContainer: {
    backgroundColor: CORES.card,
    borderRadius: 20,
    marginVertical: 8,
    padding: 16,
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
    alignItems: 'center',
    gap: 15,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: CORES.fundoCard,
  },
  perfumeImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: CORES.fundoCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTextContainer: { 
    flex: 1,
    marginRight: 10,
  },
  itemName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: CORES.textoPrincipal, 
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  itemBrand: {
    fontSize: 14,
    color: CORES.textoSecundario,
    marginBottom: 6,
    fontWeight: '500',
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