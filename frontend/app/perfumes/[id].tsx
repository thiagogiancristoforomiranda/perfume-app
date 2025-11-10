// app/perfumes/[id].tsx

import { View, Text, StyleSheet, Image, ActivityIndicator, SafeAreaView, Alert, Pressable, StatusBar, ScrollView, Animated, Dimensions, Platform, Easing } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
  gradiente: ['#FFD700', '#FFE55C', '#B8860B'],
};

interface Perfume {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string | null;
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
  const imageScale = useRef(new Animated.Value(1)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;

  const createAnimatedBackground = () => {
    return {
      backgroundColor: CORES.fundo,
      backgroundGradient: {
        colors: [CORES.fundo, CORES.fundoCard, CORES.fundo],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      }
    };
  };

  const obterNotasOlfativas = (perfumeName: string): NotasOlfativas => {
    const notasBase: { [key: string]: NotasOlfativas } = {
        'La vie est Belle Lancôme EDP 100 ML': {
            saida: ['Pera', 'Cassis', 'Groselha Preta'],
            coracao: ['Íris', 'Jasmim', 'Flor de Laranjeira'],
            base: ['Pralinê', 'Baunilha', 'Patchouli']
        },
        'Miracle Lancôme EDP 30 ML': {
            saida: ['Lichia', 'Frésia'],
            coracao: ['Magnólia', 'Gengibre', 'Pimenta'],
            base: ['Âmbar', 'Almíscar', 'Jasmim']
        },
        'Kenzo Amour EDP 30 ML': {
            saida: ['Chá Branco', 'Arroz'],
            coracao: ['Flor de Cerejeira', 'Jasmim-Manga', 'Heliotrópio'],
            base: ['Baunilha', 'Incenso', 'Madeiras']
        },
        'CK One Calvin Klein EDT 200 ML': {
            saida: ['Abacaxi', 'Limão', 'Bergamota', 'Cardamomo'],
            coracao: ['Violeta', 'Noz-moscada', 'Raiz de Orris'],
            base: ['Sândalo', 'Almíscar', 'Cedro']
        },
        'Cool Water Davidoff EDT 125 ML': {
            saida: ['Água do Mar', 'Menta', 'Lavanda', 'Coentro'],
            coracao: ['Sândalo', 'Néroli', 'Gerânio'],
            base: ['Almíscar', 'Musgo de Carvalho', 'Tabaco']
        },
        'Silver Scent Jacques Bogart EDT 200 ML': {
            saida: ['Flor de Laranjeira', 'Limão'],
            coracao: ['Alecrim', 'Lavanda', 'Noz-moscada'],
            base: ['Fava Tonka', 'Madeira de Teca', 'Vetiver']
        },
        'Good Girl Carolina Herrera EDP 150 ML': {
            saida: ['Amêndoa', 'Café', 'Bergamota'],
            coracao: ['Tuberosa', 'Jasmim Sambac', 'Flor de Laranjeira'],
            base: ['Fava Tonka', 'Cacau', 'Baunilha']
        },
        '212 Vip Men Carolina Herrera EDT 200 ML': {
            saida: ['Maracujá', 'Gengibre', 'Pimenta'],
            coracao: ['Vodka', 'Gin', 'Menta'],
            base: ['Âmbar', 'Couro', 'Notas Amadeiradas']
        },
        '212 Vip Black Carolina Herrera EDP 200 ML': {
            saida: ['Absinto', 'Anis', 'Erva-doce'],
            coracao: ['Lavanda'],
            base: ['Baunilha Negra', 'Almíscar']
        },
        'Aromatics Elixir Clinique EDP 100 ML': {
            saida: ['Camomila', 'Sálvia', 'Verbena'],
            coracao: ['Rosa', 'Jasmim', 'Ylang Ylang'],
            base: ['Musgo de Carvalho', 'Patchouli', 'Vetiver']
        },
        'Red Door Elizabeth Arden EDT 100 ML': {
            saida: ['Flor de Laranjeira', 'Ameixa', 'Violeta'],
            coracao: ['Rosa', 'Orquídea', 'Jasmim'],
            base: ['Mel', 'Sândalo', 'Heliotrópio']
        },
        'Giorgio Beverly Hills EDT 90 ML': {
            saida: ['Damasco', 'Flor de Laranjeira', 'Pêssego'],
            coracao: ['Tuberosa', 'Gardênia', 'Ylang Ylang'],
            base: ['Sândalo', 'Baunilha', 'Musgo de Carvalho']
        },
        'Midnight Fantasy Britney Spears EDP 100 ML': {
            saida: ['Ameixa', 'Cereja Amarga'],
            coracao: ['Íris', 'Orquídea', 'Frésia'],
            base: ['Âmbar', 'Almíscar', 'Baunilha']
        },
        'Rose Goldea BVLGARI EDP 90 ML': {
            saida: ['Romã', 'Rosa', 'Bergamota'],
            coracao: ['Rosa Damascena', 'Jasmim', 'Peônia'],
            base: ['Almíscar', 'Sândalo', 'Baunilha']
        },
        'Miss Dior Blooming Bouquet EDT 50 ML': {
            saida: ['Mandarina Siciliana'],
            coracao: ['Peônia Rosa', 'Rosa Damascena', 'Damasco'],
            base: ['Almíscar Branco']
        },
        'BVLGARI Wood Essence EDP 60 ML': {
            saida: ['Casca de Laranja', 'Coentro'],
            coracao: ['Cipreste', 'Vetiver'],
            base: ['Benjoim', 'Cedro', 'Âmbar Gris']
        },
        'Dolce & Gabbana Feminino Tradicional EDT 100 ML': {
            saida: ['Mandarina', 'Bergamota', 'Lichia'],
            coracao: ['Lírio', 'Jasmim', 'Ameixa'],
            base: ['Baunilha', 'Âmbar', 'Almíscar']
        },
        'Dolce & Gabbana Light Blue Pour Homme EDT 40 ML': {
            saida: ['Toranja', 'Bergamota', 'Mandarina Siciliana'],
            coracao: ['Pimenta', 'Alecrim', 'Jacarandá'],
            base: ['Almíscar', 'Incenso', 'Musgo de Carvalho']
        },
        'Dune Pour Homme DIOR EDT 100 ML': {
            saida: ['Folha de Figo', 'Cassis', 'Sálvia'],
            coracao: ['Casca de Figueira', 'Rosa'],
            base: ['Sândalo', 'Fava Tonka', 'Cedro']
        },
        'J\'adore DIOR EDP 50 ML': {
            saida: ['Pera', 'Melão', 'Magnólia', 'Pêssego'],
            coracao: ['Jasmim', 'Tuberosa', 'Rosa'],
            base: ['Almíscar', 'Baunilha', 'Cedro']
        },
        'Poison DIOR EDT 50 ML': {
            saida: ['Ameixa', 'Coentro', 'Anis'],
            coracao: ['Tuberosa', 'Incenso', 'Mel Branco'],
            base: ['Baunilha', 'Sândalo', 'Almíscar']
        },
        'K de Dolce & Gabbana Pour Homme EDT 100 ML': {
            saida: ['Laranja Sanguínea', 'Limão Siciliano', 'Zimbro'],
            coracao: ['Pimentão', 'Sálvia', 'Lavanda'],
            base: ['Cedro', 'Vetiver', 'Patchouli']
        },
        'All of Me de Narciso Rodriguez EDP 50 ML': {
            saida: ['Magnólia'],
            coracao: ['Rosa', 'Gerânio Bourbon'],
            base: ['Almíscar', 'Sândalo']
        },
        'Narciso Poudrée EDP 50 ML': {
            saida: ['Rosa Búlgara', 'Jasmim', 'Flor de Laranjeira'],
            coracao: ['Almíscar'],
            base: ['Vetiver', 'Cedro', 'Patchouli']
        },
        'Girl of Now Elie Saab EDP 50 ML': {
            saida: ['Pistache', 'Pera', 'Mandarina'],
            coracao: ['Amêndoa', 'Flor de Laranjeira', 'Magnólia'],
            base: ['Leite de Amêndoas', 'Fava Tonka', 'Patchouli']
        },
        'Omnia Crystalline BVLGARI EDT 50 ML': {
            saida: ['Bambu', 'Pera'],
            coracao: ['Lótus', 'Chá', 'Cassis'],
            base: ['Madeira Guaiac', 'Musgo de Carvalho', 'Almíscar']
        },
        'Au Thé Blanc BVLGARI EDC 75 ML': {
            saida: ['Chá Branco', 'Artemísia', 'Bergamota'],
            coracao: ['Pimenta', 'Cardamomo', 'Coentro'],
            base: ['Almíscar', 'Âmbar', 'Notas Amadeiradas']
        },
        'Fahrenheit DIOR EDT 50 ML': {
            saida: ['Lavanda', 'Mandarina', 'Noz-moscada'],
            coracao: ['Folha de Violeta', 'Cravo', 'Madressilva'],
            base: ['Couro', 'Vetiver', 'Patchouli']
        },
        'Sauvage DIOR Parfum 100 ML': {
            saida: ['Bergamota', 'Mandarina', 'Elemi'],
            coracao: ['Sândalo'],
            base: ['Fava Tonka', 'Incenso', 'Baunilha']
        },
        'Sauvage DIOR EDT 60 ML': {
            saida: ['Pimenta', 'Bergamota da Calábria'],
            coracao: ['Gerânio', 'Lavanda', 'Pimenta de Szechuan'],
            base: ['Cedro', 'Ambroxan', 'Ládano']
        },
        'Narciso Rodriguez For Her EDT 100 ML': {
            saida: ['Osmanthus', 'Flor de Laranjeira', 'Bergamota'],
            coracao: ['Almíscar', 'Âmbar'],
            base: ['Vetiver', 'Baunilha', 'Patchouli']
        },
        'L\'eau D\'issey Pour Homme EDT 125 ML': {
            saida: ['Yuzu', 'Limão', 'Estragão'],
            coracao: ['Noz-moscada', 'Lótus', 'Canela'],
            base: ['Sândalo', 'Cedro', 'Vetiver']
        },
        'Devotion de Dolce & Gabbana Feminino EDP 50 ML': {
            saida: ['Limão Confitado'],
            coracao: ['Flor de Laranjeira', 'Panna Cotta'],
            base: ['Baunilha']
        },
        'Elie Saab Le Parfum Lumière EDP 50 ML': {
            saida: ['Flor de Laranjeira', 'Mandarina', 'Ylang Ylang'],
            coracao: ['Jasmim Sambac', 'Gardênia', 'Tuberosa'],
            base: ['Patchouli', 'Âmbar', 'Almíscar']
        },
        'BVLGARI Rain Essence EDP 60 ML': {
            saida: ['Chá Verde', 'Laranja'],
            coracao: ['Lótus Branco', 'Almíscar'],
            base: ['Âmbar Mineral', 'Madeira Guaiac']
        },
        'Dior Addict EDP 30 ML': {
            saida: ['Flor de Laranjeira', 'Folha de Amoreira'],
            coracao: ['Jasmim Sambac', 'Rosa Búlgara'],
            base: ['Baunilha Bourbon', 'Sândalo']
        },
        'Dolce & Gabbana Light Blue Feminino EDT 50 ML': {
            saida: ['Limão Siciliano', 'Maçã Granny Smith', 'Câmpanula'],
            coracao: ['Bambu', 'Jasmim', 'Rosa Branca'],
            base: ['Cedro', 'Âmbar', 'Almíscar']
        },
        'Miss Dior Parfum 50 ML': {
            saida: ['Mandarina', 'Bergamota'],
            coracao: ['Rosa de Grasse', 'Jasmim'],
            base: ['Patchouli', 'Almíscar']
        },
        'Fusion D’issey Extrême EDT 50 ML': {
            saida: ['Cardamomo', 'Bergamota'],
            coracao: ['Menta', 'Lava', 'Coco'],
            base: ['Sândalo', 'Patchouli']
        },
        'Invictus': {
            saida: ['Toranja', 'Água Marinha', 'Cardamomo'],
            coracao: ['Folha de Amora', 'Ámbar'],
            base: ['Âmbar Gris', 'Baunilha', 'Musk']
        },
        'Aqua di Gio Profondo': {
            saida: ['Bergamota', 'Mandarina', 'Néroli'],
            coracao: ['Alecrim Marinho', 'Violeta', 'Pimenta Rosa'],
            base: ['Patchouli', 'Incenso', 'Musk']
        }
    };
    if (notasBase[perfumeName]) {
      return notasBase[perfumeName];
    }
    return {
      saida: ['Nota Cítrica', 'Nota Frutal'],
      coracao: ['Nota Floral', 'Nota Especiada'],
      base: ['Nota Amadeirada', 'Nota Musk']
    };
  };

  const checkFavorite = async () => {
    if (!signed || !perfume) return;
    try {
      const response = await api.get(`/favorites/check/${perfume.id}/`);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      console.error("Erro ao verificar favorito:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!signed) {
      Alert.alert("✨ Atenção", "Faça login para adicionar aos seus favoritos!");
      router.push({ pathname: '/login' } as any);
      return;
    }
    if (!perfume) return;
    
    setFavoriteLoading(true);
    
    Animated.sequence([
      Animated.timing(imageScale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(imageScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    try {
      const response = await api.post('/favorites/toggle/', { perfume_id: perfume.id });
      setIsFavorite(response.data.is_favorite);
      
      if (response.data.is_favorite) {
        Alert.alert("💖 Adicionado aos favoritos!");
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
            Animated.timing(fadeAnim, { 
              toValue: 1, 
              duration: 1000, 
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slideAnim, { 
              toValue: 0, 
              duration: 800, 
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            })
          ]).start();
        });
    }
  }, [id]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: parallaxAnim } } }],
    { useNativeDriver: false }
  );

  const imageTranslateY = parallaxAnim.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const imageOpacity = parallaxAnim.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (perfume && signed) {
      checkFavorite();
    }
  }, [perfume, signed]);

  useLayoutEffect(() => {
    if (perfume) {
      navigation.setOptions({
        headerTransparent: true,
        headerTitle: '',
        headerStyle: { backgroundColor: 'transparent', shadowColor: 'transparent', elevation: 0 },
        headerTintColor: CORES.dourado,
        headerBackTitleVisible: false,
        headerLeft: () => (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={CORES.dourado} />
            </Pressable>
          </Animated.View>
        ),
        headerRight: () => (
          <Animated.View style={[styles.headerRight, { opacity: fadeAnim }]}>
            <Pressable onPress={toggleFavorite} disabled={favoriteLoading} style={styles.favoriteButton}>
              {favoriteLoading ? (
                <ActivityIndicator size="small" color={CORES.dourado} />
              ) : (
                <Animated.View style={{ transform: [{ scale: imageScale }] }}>
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={26} 
                    color={isFavorite ? CORES.erro : CORES.textoPrincipal} 
                  />
                </Animated.View>
              )}
            </Pressable>
            {/* --- ALTERAÇÃO: Removendo o botão de Compartilhar --- */}
            {/* <Pressable style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={24} color={CORES.textoPrincipal} />
            </Pressable> */}
            {/* --- FIM DA ALTERAÇÃO --- */}
          </Animated.View>
        ),
      });
    }
  }, [navigation, perfume, isFavorite, favoriteLoading]);

  const handleAddToCart = async () => {
    if (!signed) {
      Alert.alert("🛒 Atenção", "Faça login para adicionar itens ao carrinho!");
      router.push({ pathname: '/login' } as any);
      return;
    }
    try {
      await api.post('/cart/add/', { perfume_id: perfume?.id, quantity: 1 });
      Alert.alert(
        "🎉 Adicionado ao Carrinho!", 
        `${perfume?.name} foi adicionado com sucesso!`,
        [{ text: "Continuar Comprando", style: "cancel" }, { text: "Ver Carrinho", onPress: () => router.push('/cart') }]
      );
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      Alert.alert("❌ Erro", "Não foi possível adicionar o item ao carrinho.");
    }
  };

  const NotaOlfativaCard = ({ titulo, notas, cor, icone }: { titulo: string, notas: string[], cor: string, icone: string }) => (
    <Animated.View style={[ styles.notaContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.notaHeader, { borderLeftColor: cor }]}>
        <View style={styles.notaTitleContainer}>
          <Ionicons name={icone as any} size={20} color={cor} />
          <Text style={styles.notaTitulo}>{titulo}</Text>
        </View>
        <View style={[styles.notaIndicator, { backgroundColor: cor }]} />
      </View>
      <View style={styles.notasList}>
        {notas.map((nota, index) => (
          <View key={index} style={styles.notaItem}>
            <View style={[styles.notaBullet, { backgroundColor: cor }]} />
            <Text style={styles.notaText}>{nota}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const FeatureItem = ({ icon, text, delay }: { icon: string, text: string, delay: number }) => (
    <Animated.View style={[ styles.featureItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: fadeAnim }] }]}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon as any} size={24} color={CORES.dourado} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={CORES.dourado} />
        <Text style={styles.loadingText}>Carregando fragrância...</Text>
      </View>
    );
  }

  if (!perfume) {
    return (
      <View style={styles.loaderContainer}>
        <Ionicons name="sad-outline" size={64} color={CORES.dourado} />
        <Text style={styles.errorText}>Perfume não encontrado</Text>
        <Pressable style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  let imageUrl: string | null = null;
  if (perfume.image && typeof perfume.image === 'string') {
    if (Platform.OS === 'web') {
      imageUrl = perfume.image;
    } else {
      imageUrl = perfume.image.replace('127.0.0.1', '192.168.0.101');
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.backgroundGradient} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[ styles.imageContainer, { transform: [{ translateY: imageTranslateY }], opacity: imageOpacity } ]}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.perfumeImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="flower-outline" size={80} color={CORES.dourado} />
              <Text style={styles.imagePlaceholderText}>Imagem do Perfume</Text>
            </View>
          )}
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 0, y: 1 }} 
            style={styles.imageGradientOverlay} 
          />
        </Animated.View>

        <Animated.View style={[ styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] } ]}>
          <View style={styles.headerInfo}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{perfume.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={20} color={CORES.dourado} />
                <Text style={styles.ratingText}>4.8</Text>
                <Text style={styles.ratingCount}>(248 avaliações)</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>R$ {perfume.price}</Text>
            <View style={styles.priceBadge}>
              <Ionicons name="pricetag-outline" size={14} color={CORES.fundo} />
              <Text style={styles.priceBadgeText}>PREÇO ESPECIAL</Text>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            <FeatureItem icon="time-outline" text="12h Duração" delay={100} />
            <FeatureItem icon="expand-outline" text="Alta Projeção" delay={200} />
            <FeatureItem icon="leaf-outline" text="Natural" delay={300} />
            <FeatureItem icon="diamond-outline" text="Premium" delay={400} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color={CORES.dourado} />
              <Text style={styles.sectionTitle}>Sobre a Fragrância</Text>
            </View>
            <Text style={styles.description}>{perfume.description}</Text>
          </View>

          {notasOlfativas && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="layers-outline" size={24} color={CORES.dourado} />
                <Text style={styles.sectionTitle}>Pirâmide Olfativa</Text>
              </View>
              <View style={styles.notasGrid}>
                <NotaOlfativaCard 
                  titulo="Notas de Saída" 
                  notas={notasOlfativas.saida} 
                  cor="#4ECDC4"
                  icone="leaf-outline"
                />
                <NotaOlfativaCard 
                  titulo="Notas de Coração" 
                  notas={notasOlfativas.coracao} 
                  cor="#FF6B6B"
                  icone="flower-outline"
                />
                <NotaOlfativaCard 
                  titulo="Notas de Base" 
                  notas={notasOlfativas.base} 
                  cor="#FFD93D"
                  icone="diamond-outline"
                />
              </View>
            </View>
          )}

          <View style={styles.guaranteeCard}>
            <Ionicons name="shield-checkmark-outline" size={32} color={CORES.dourado} />
            <View style={styles.guaranteeText}>
              <Text style={styles.guaranteeTitle}>Garantia de Autenticidade</Text>
              <Text style={styles.guaranteeSubtitle}>Produto 100% original com selo de qualidade</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.footerContent}>
          <Pressable 
            style={({ pressed }) => [
              styles.cartButton,
              pressed && styles.buttonPressed
            ]} 
            onPress={handleAddToCart}
          >
            <View style={styles.cartButtonContent}>
              <Ionicons name="cart-outline" size={22} color={CORES.botaoTexto} />
              <Text style={styles.cartButtonText}>ADICIONAR AO CARRINHO</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>R$ {perfume.price}</Text>
            </View>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: CORES.fundoCard,
  },
  scrollView: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: CORES.fundo,
  },
  loadingText: {
    color: CORES.textoSecundario,
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: CORES.textoSecundario,
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: CORES.dourado,
    borderRadius: 25,
  },
  retryButtonText: {
    color: CORES.botaoTexto,
    fontWeight: '600',
    fontSize: 16,
  },
  imageContainer: {
    height: 500,
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
    marginTop: 15,
    fontSize: 16,
  },
  
  imageGradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  
  contentContainer: {
    backgroundColor: CORES.fundo,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 120,
  },
  headerInfo: {
    marginBottom: 25,
  },
  titleContainer: {
    gap: 10,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: CORES.textoPrincipal,
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    color: CORES.dourado,
    fontWeight: '700',
    fontSize: 16,
  },
  ratingCount: {
    color: CORES.textoSecundario,
    fontSize: 14,
  },
  priceContainer: {
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: CORES.dourado,
    letterSpacing: 0.5,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.dourado,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  priceBadgeText: {
    color: CORES.fundo,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 35,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  featureText: {
    fontSize: 11,
    color: CORES.textoSecundario,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 35,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: CORES.textoSecundario,
    letterSpacing: 0.3,
  },
  notasGrid: {
    gap: 20,
  },
  notaContainer: {
    backgroundColor: CORES.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 4,
  },
  notaTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  notaTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
  },
  notaIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notasList: {
    gap: 12,
  },
  notaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notaBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notaText: {
    fontSize: 15,
    color: CORES.textoSecundario,
    fontWeight: '500',
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORES.card,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    gap: 15,
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginBottom: 4,
  },
  guaranteeSubtitle: {
    fontSize: 14,
    color: CORES.textoSecundario,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  // O estilo wishlistButton não é mais usado após a remoção do botão de favoritos do rodapé
  // wishlistButton: { 
  //   width: 50,
  //   height: 50,
  //   borderRadius: 25,
  //   backgroundColor: CORES.card,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderWidth: 1,
  //   borderColor: CORES.borda,
  // },
  cartButton: {
    flex: 1,
    backgroundColor: CORES.dourado,
    borderRadius: 25,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flex: 1,
  },
  cartButtonText: {
    color: CORES.botaoTexto,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  priceTag: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 18,
  },
  priceTagText: {
    color: CORES.botaoTexto,
    fontSize: 14,
    fontWeight: '800',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // O estilo shareButton não é mais usado após a remoção do botão de compartilhamento do cabeçalho
  // shareButton: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: 'rgba(0,0,0,0.5)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
});