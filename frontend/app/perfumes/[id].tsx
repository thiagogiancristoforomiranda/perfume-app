// app/perfumes/[id].tsx
import { View, Text, StyleSheet, Image, ActivityIndicator, SafeAreaView, Button, Alert, Pressable, StatusBar, ScrollView, Animated, Dimensions, Platform } from 'react-native'; // 1. Importar Platform
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../src/services/api';
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
  placeholderImg: '#2C2C2C', 
};

interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: string;
  description: string;
  image: string | null; // A imagem PODE SER nula
}

interface NotasOlfativas {
  saida: string[];
  coracao: string[];
  base: string[];
}

export default function PerfumeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [notasOlfativas, setNotasOlfativas] = useState<NotasOlfativas | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { signed } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Simulação de notas olfativas (com tipo de retorno corrigido)
  const obterNotasOlfativas = (perfumeName: string): NotasOlfativas => {
    const notasBase: { [key: string]: NotasOlfativas } = {
      'Invictus': {
        saida: ['Toranja', 'Água Marinha', 'Cardamomo'],
        coracao: ['Folha de Amora', 'Ámbar'],
        base: ['Âmbar Gris', 'Baunilha', 'Musk']
      },
      'Aqua di Gio Profondo': {
        saida: ['Bergamota', 'Mandarina', 'Néroli'],
        coracao: ['Alecrim Marinho', 'Violeta', 'Pimenta Rosa'],
        base: ['Patchouli', 'Incenso', 'Musk']
      },
      'Imícias': {
        saida: ['Lima', 'Pimenta Rosa', 'Folhas Verdes'],
        coracao: ['Jasmim', 'Tuberosa', 'Ylang-Ylang'],
        base: ['Musk', 'Âmbar', 'Sândalo']
      }
    };
    return notasBase[perfumeName] || {
      saida: ['Nota Cítrica', 'Nota Frutal'],
      coracao: ['Nota Floral', 'Nota Especiada'],
      base: ['Nota Amadeirada', 'Nota Musk']
    };
  };

  // Verificar se o perfume é favorito
  const checkFavorite = async () => {
    if (!signed || !perfume) return;
    try {
      const response = await api.get(`/favorites/check/${perfume.id}/`);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error("Erro ao verificar favorito:", error);
    }
  };

  // Toggle favorito
  const toggleFavorite = async () => {
    if (!signed) {
      Alert.alert("Atenção", "Você precisa fazer o login para favoritar perfumes.");
      router.push({ pathname: '/login' } as any);
      return;
    }
    if (!perfume) return;
    setFavoriteLoading(true);
    try {
      const response = await api.post('/favorites/toggle/', {
        perfume_id: perfume.id,
      });
      setIsFavorite(response.data.is_favorite);
      if (response.data.is_favorite) {
        Alert.alert("❤️ Adicionado aos favoritos!");
      } else {
        Alert.alert("💔 Removido dos favoritos");
      }
    } catch (error) {
      console.error("Erro ao favoritar:", error);
      Alert.alert("Erro", "Não foi possível favoritar o perfume.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Busca os dados
  useEffect(() => {
    if (id) {
      api.get(`/perfumes/${id}/`)
        .then(response => {
          const perfumeData = response.data;
          setPerfume(perfumeData);
          if (perfumeData && perfumeData.name) {
             setNotasOlfativas(obterNotasOlfativas(perfumeData.name));
          }
        })
        .catch(error => console.error("Erro ao buscar detalhe do perfume:", error))
        .finally(() => {
          setLoading(false);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
          ]).start();
        });
    }
  }, [id]);

  // Verifica favoritos quando logado
  useEffect(() => {
    if (perfume && signed) {
      checkFavorite();
    }
  }, [perfume, signed]);

  // Atualiza o cabeçalho
  useLayoutEffect(() => {
    if (perfume) {
      navigation.setOptions({
        title: perfume.name,
        headerStyle: { backgroundColor: CORES.fundo, shadowColor: 'transparent', elevation: 0 },
        headerTintColor: CORES.dourado,
        headerTitleStyle: { color: CORES.textoPrincipal, fontWeight: '600', fontSize: 18 },
        headerBackTitleVisible: false,
        headerRight: () => (
          <Pressable onPress={toggleFavorite} disabled={favoriteLoading} style={{ marginRight: 15 }}>
            {favoriteLoading ? (
              <ActivityIndicator size="small" color={CORES.dourado} />
            ) : (
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? CORES.erro : CORES.textoPrincipal} 
              />
            )}
          </Pressable>
        ),
      });
    }
  }, [navigation, perfume, isFavorite, favoriteLoading]);

  // Função para adicionar ao carrinho
  const handleAddToCart = async () => {
    if (!signed) {
      Alert.alert("Atenção", "Você precisa fazer o login para adicionar itens ao carrinho.");
      router.push({ pathname: '/login' } as any);
      return;
    }
    try {
      await api.post('/cart/add/', {
        perfume_id: perfume?.id,
        quantity: 1,
      });
      Alert.alert("🎉 Sucesso!", `${perfume?.name} foi adicionado ao carrinho.`);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      Alert.alert("Erro", "Não foi possível adicionar o item ao carrinho.");
    }
  };

  // Componente de Nota Olfativa
  const NotaOlfativaCard = ({ titulo, notas, cor }: { titulo: string, notas: string[], cor: string }) => (
    <View style={styles.notaContainer}>
      <View style={[styles.notaHeader, { borderLeftColor: cor }]}>
        <Text style={styles.notaTitulo}>{titulo}</Text>
        <Ionicons name="ellipse" size={8} color={cor} />
      </View>
      <View style={styles.notasList}>
        {notas.map((nota, index) => (
          <View key={index} style={styles.notaItem}>
            <Ionicons name="flower-outline" size={14} color={cor} />
            <Text style={styles.notaText}>{nota}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: CORES.fundo }]}>
        <ActivityIndicator size="large" color={CORES.dourado} />
        <Text style={styles.loadingText}>Carregando fragrância...</Text>
      </View>
    );
  }

  if (!perfume) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: CORES.fundo }]}>
        <Ionicons name="sad-outline" size={64} color={CORES.dourado} />
        <Text style={styles.errorText}>Perfume não encontrado.</Text>
      </View>
    );
  }

  // ===== CORREÇÃO DE LÓGICA DA URL DA IMAGEM =====
  let imageUrl: string | null = null;
  if (perfume.image && typeof perfume.image === 'string') {
    // A API retorna a URL completa (ex: http://127.0.0.1:8000/media/...)
    if (Platform.OS === 'web') {
      // Na WEB (localhost), 127.0.0.1 funciona.
      imageUrl = perfume.image;
    } else {
      // No MOBILE (Expo Go), 127.0.0.1 NÃO funciona.
      // Precisamos substituir pelo IP da rede (o mesmo do seu api.js)
      // Substitua '192.168.0.101' pelo seu IP de rede se for diferente.
      imageUrl = perfume.image.replace('127.0.0.1', '192.168.0.101'); 
    }
  }
  // =============================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagem do Perfume (com verificação) */}
        <Animated.View 
          style={[
            styles.imageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.perfumeImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color={CORES.textoSecundario} />
              <Text style={styles.imagePlaceholderText}>Sem Imagem</Text>
            </View>
          )}
          <View style={styles.imageOverlay} />
        </Animated.View>

        {/* Conteúdo Principal */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.brand}>{perfume.brand ?? 'Marca'}</Text>
              <Text style={styles.name}>{perfume.name}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color={CORES.dourado} />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          {/* Preço */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>R$ {perfume.price}</Text>
            <Text style={styles.priceLabel}>Preço à vista</Text>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{perfume.description}</Text>
          </View>

          {/* Notas Olfativas */}
          {notasOlfativas && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pirâmide Olfativa</Text>
              <View style={styles.notasGrid}>
                <NotaOlfativaCard 
                  titulo="Notas de Saída" 
                  notas={notasOlfativas.saida} 
                  cor="#4ECDC4" 
                />
                <NotaOlfativaCard 
                  titulo="Notas de Coração" 
                  notas={notasOlfativas.coracao} 
                  cor="#FF6B6B" 
                />
                <NotaOlfativaCard 
                  titulo="Notas de Base" 
                  notas={notasOlfativas.base} 
                  cor="#FFD93D" 
                />
              </View>
            </View>
          )}

          {/* Características */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="time-outline" size={20} color={CORES.dourado} />
              <Text style={styles.featureText}>Longa Duração</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="expand-outline" size={20} color={CORES.dourado} />
              <Text style={styles.featureText}>Alta Projeção</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="leaf-outline" size={20} color={CORES.dourado} />
              <Text style={styles.featureText}>Ingredientes Naturais</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Botão Fixo */}
      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Pressable 
          style={({ pressed }) => [
            styles.buttonPressable,
            pressed && styles.buttonPressed
          ]} 
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color={CORES.botaoTexto} />
          <Text style={styles.buttonText}>ADICIONAR AO CARRINHO</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

// ... (Todos os seus styles 'lindos' continuam os mesmos) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: CORES.fundo, 
  },
  loadingText: {
    color: CORES.textoSecundario,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: CORES.textoSecundario,
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 350,
    backgroundColor: CORES.card, 
  },
  perfumeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CORES.card,
  },
  imagePlaceholderText: {
    color: CORES.textoSecundario,
    marginTop: 10,
    fontSize: 14,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  contentContainer: {
    backgroundColor: CORES.fundo,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brand: {
    fontSize: 14,
    color: CORES.dourado,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CORES.textoPrincipal,
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: {
    color: CORES.textoPrincipal,
    fontWeight: '600',
    fontSize: 14,
  },
  priceContainer: {
    marginBottom: 30,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: CORES.dourado,
    letterSpacing: 0.5,
  },
  priceLabel: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: CORES.textoSecundario,
  },
  notasGrid: {
    gap: 15,
  },
  notaContainer: {
    backgroundColor: CORES.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  notaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 3,
  },
  notaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
  },
  notasList: {
    gap: 8,
  },
  notaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notaText: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  footer: {
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
  buttonPressable: {
    backgroundColor: CORES.dourado,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 25,
    gap: 12,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    color: CORES.botaoTexto,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});