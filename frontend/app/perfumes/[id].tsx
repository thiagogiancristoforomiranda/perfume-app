// app/perfumes/[id].tsx
import { View, Text, StyleSheet, Image, ActivityIndicator, SafeAreaView, Button, Alert, Pressable, StatusBar, ScrollView, Animated, Dimensions, Platform } from 'react-native';
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

  //
  // --- AQUI ESTÃO AS NOTAS DE TODOS OS SEUS PERFUMES ---
  //
  const obterNotasOlfativas = (perfumeName: string): NotasOlfativas => {
    const notasBase: { [key: string]: NotasOlfativas } = {
        // PERFUMES DA SUA LISTA
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
        // PERFUMES QUE JÁ ESTAVAM NO CÓDIGO ANTERIOR
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
    
    // Se não achar, retorna o padrão
    return {
      saida: ['Nota Cítrica', 'Nota Frutal'],
      coracao: ['Nota Floral', 'Nota Especiada'],
      base: ['Nota Amadeirada', 'Nota Musk']
    };
  };
  //
  // --- FIM DA SEÇÃO DE NOTAS ---
  //

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

  // Lógica da URL da imagem
  let imageUrl: string | null = null;
  if (perfume.image && typeof perfume.image === 'string') {
    if (Platform.OS === 'web') {
      imageUrl = perfume.image;
    } else {
      // *** MUDE ESSE IP SE O SEU FOR DIFERENTE ***
      imageUrl = perfume.image.replace('127.0.0.1', '192.168.0.101'); 
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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

        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerInfo}>
            <View style={{ flexShrink: 1, marginRight: 10 }}>
              <Text style={styles.name}>{perfume.name}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color={CORES.dourado} />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>R$ {perfume.price}</Text>
            <Text style={styles.priceLabel}>Preço à vista</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{perfume.description}</Text>
          </View>

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