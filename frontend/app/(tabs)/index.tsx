import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, FlatList, SafeAreaView,
    ActivityIndicator, Alert, Pressable, StatusBar, Image,
    Animated, Easing, TextInput, Dimensions, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../src/services/api';

interface Perfume {
  id: number;
  name?: string;
  price: string;
  image?: string | null;
}

// Paleta de cores refinada para boutique de luxo
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
  bordaDourada: '#D4AF37',
  vintage: '#8B4513',
};

const { width: screenWidth } = Dimensions.get('window');

// Componente de Header da Coleção separado
const CollectionHeader = () => (
  <View style={styles.collectionHeader}>
    <Text style={styles.collectionTitle}>Coleção Exclusiva</Text>
    <Text style={styles.collectionSubtitle}>Fragrâncias que contam histórias</Text>
  </View>
);

// Componente de Efeito de Brilho
const GlowEffect = () => {
  const glowAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    const glowSequence = Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(glowSequence).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View 
      style={[
        styles.glowBackground,
        {
          opacity: glowOpacity,
          transform: [{ scale: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1]
          })}]
        }
      ]} 
    />
  );
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
  const logoAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();

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

  useEffect(() => {
    fetchPerfumes();
    
    // Animação sequencial mais elaborada
    Animated.sequence([
      // Primeiro a logo
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      // Depois o conteúdo
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
      ])
    ]).start();
  }, []);

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const PerfumeCard = ({ item, index }: { item: Perfume; index: number }) => {
    const [scaleValue] = useState(new Animated.Value(1));
    const [imageError, setImageError] = useState(false);
    const [cardHovered, setCardHovered] = useState(false);
    
    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
      setCardHovered(true);
    };
    
    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      setCardHovered(false);
    };

    let imageUrl: string | null = null;
    
    if (item.image && !imageError) {
      if (Platform.OS === 'web') {
        imageUrl = item.image;
      } else {
        const baseURL = API_URL.replace('/api', '');
        if (item.image.startsWith('http')) {
          imageUrl = item.image;
        } else {
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
                backgroundColor: cardHovered ? CORES.cardHover : CORES.card,
                borderColor: cardHovered ? CORES.bordaDourada : CORES.borda,
              },
            ]}
          >
            {/* Efeito de brilho no hover */}
            {cardHovered && (
              <View style={styles.cardGlow} />
            )}
            
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
                {/* Badge de luxo */}
                <View style={styles.luxuryBadge}>
                  <Ionicons name="diamond" size={12} color={CORES.dourado} />
                </View>
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name ?? 'Perfume Exclusivo'}
                  </Text>
                  
                  {/* Espaço reservado para informações adicionais se necessário no futuro */}
                  <View style={styles.extraInfoSpace} />
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.itemPrice}>R$ {item.price}</Text>
                  <View style={[styles.buyButton, cardHovered && styles.buyButtonHover]}>
                    <Ionicons name="arrow-forward" size={16} color={CORES.fundo} />
                  </View>
                </View>
              </View>
            </View>

            {/* Linha decorativa dourada */}
            <View style={styles.goldLine} />
          </Animated.View>
        </Pressable>
      </Link>
    );
  };

  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '70%'],
  });

  // Componente para lista vazia
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={pesquisa ? "search-outline" : "rose-outline"} 
        size={64} 
        color={CORES.dourado} 
      />
      <Text style={styles.emptyListText}>
        {pesquisa ? 'Nenhum perfume encontrado' : 'Nossa coleção está sendo preparada'}
      </Text>
      <Text style={styles.emptyListSubtext}>
        {pesquisa ? 'Tente outros termos de busca' : 'Volte em breve para descobrir nossas fragrâncias'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />

      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: logoAnim,
            transform: [{ translateY: logoAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0]
            }) }]
          }
        ]}
      >
        {/* Efeito de brilho atrás da logo */}
        <GlowEffect />
        
        <View style={styles.headerContent}>
          {!modoPesquisa && (
            <View style={styles.logoContainer}>
              <Animated.View 
                style={[
                  styles.logoWrapper,
                  {
                    transform: [{
                      rotate: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-10deg', '0deg']
                      })
                    }]
                  }
                ]}
              >
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logo}
                />
              </Animated.View>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Perfumaria</Text>
                <Text style={styles.subtitleMain}>LEDO</Text>
                <View style={styles.titleUnderline} />
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
          <Animated.View 
            style={{
              opacity: logoAnim,
              transform: [{
                translateX: logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, 0]
                })
              }]
            }}
          >
            <Text style={styles.legacyText}>desde 1950</Text>
            <View style={styles.heritageLine} />
          </Animated.View>
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
            ListHeaderComponent={
              !modoPesquisa && !pesquisa ? CollectionHeader : null
            }
            ListEmptyComponent={EmptyListComponent}
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: 300,
    backgroundColor: CORES.dourado,
    borderRadius: 150,
    opacity: 0.3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoWrapper: {
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    color: CORES.textoPrincipal,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 2,
    fontFamily: 'System',
  },
  subtitleMain: {
    color: CORES.dourado,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: -6,
    textShadowColor: CORES.dourado,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleUnderline: {
    width: '100%',
    height: 2,
    backgroundColor: CORES.dourado,
    marginTop: 4,
    opacity: 0.7,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    overflow: 'hidden',
  },
  searchInput: {
    backgroundColor: CORES.card,
    color: CORES.textoPrincipal,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    fontSize: 16,
    borderWidth: 1,
    borderColor: CORES.dourado,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  searchInfo: {
    backgroundColor: CORES.dourado,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  searchInfoText: {
    color: CORES.fundo,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  iconButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: CORES.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconButtonActive: {
    backgroundColor: CORES.dourado,
    shadowColor: CORES.dourado,
    shadowOpacity: 0.5,
  },
  legacyText: {
    color: CORES.textoSecundario,
    fontSize: 13,
    letterSpacing: 3,
    textAlign: 'center',
    fontWeight: '300',
    fontStyle: 'italic',
  },
  heritageLine: {
    width: 80,
    height: 1,
    backgroundColor: CORES.dourado,
    alignSelf: 'center',
    marginTop: 4,
    opacity: 0.5,
  },
  collectionHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  collectionTitle: {
    color: CORES.textoPrincipal,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 3,
    marginBottom: 8,
  },
  collectionSubtitle: {
    color: CORES.textoSecundario,
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  itemContainer: {
    backgroundColor: CORES.card,
    borderRadius: 24,
    marginVertical: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: CORES.dourado,
    opacity: 0.6,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: CORES.fundoCard,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
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
    borderRadius: 16,
  },
  luxuryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 4,
  },
  itemDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTextContainer: { 
    flex: 1,
    marginRight: 15,
  },
  itemName: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: CORES.textoPrincipal, 
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  extraInfoSpace: {
    height: 20, // Espaço reservado para manter o layout consistente
  },
  priceContainer: {
    alignItems: 'flex-end',
    gap: 10,
  },
  itemPrice: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: CORES.dourado,
    letterSpacing: 1,
    textShadowColor: CORES.dourado,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  buyButton: {
    backgroundColor: CORES.dourado,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  buyButtonHover: {
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.6,
  },
  goldLine: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 1,
    backgroundColor: CORES.dourado,
    opacity: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    color: CORES.textoSecundario,
    fontSize: 16,
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 20,
  },
  emptyListText: { 
    color: CORES.textoPrincipal, 
    textAlign: 'center', 
    fontSize: 20, 
    fontWeight: '600',
    letterSpacing: 1,
  },
  emptyListSubtext: { 
    color: CORES.textoSecundario, 
    textAlign: 'center', 
    fontSize: 15,
    letterSpacing: 0.5,
  },
});