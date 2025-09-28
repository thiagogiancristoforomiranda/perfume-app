import { View, Text, StyleSheet, Image, ActivityIndicator, SafeAreaView, Button, Alert } from 'react-native';
// ADICIONADO 'useNavigation' A ESTA IMPORTAÇÃO
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
// ADICIONADO 'useLayoutEffect' A ESTA IMPORTAÇÃO
import React, { useState, useEffect, useLayoutEffect } from 'react';
import api, { API_URL } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: string;
  description: string;
  image: string; 
}

export default function PerfumeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { signed } = useAuth();
  const router = useRouter();
  const navigation = useNavigation(); // Hook para acessar as opções de navegação

  useEffect(() => {
    if (id) {
      api.get(`/perfumes/${id}/`)
        .then(response => {
          setPerfume(response.data);
        })
        .catch(error => console.error("Erro ao buscar detalhe do perfume:", error))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // ===== CÓDIGO ADICIONADO PARA MUDAR O TÍTULO DO CABEÇALHO =====
  useLayoutEffect(() => {
    if (perfume) {
      navigation.setOptions({
        title: perfume.name, // Define o título da tela como o nome do perfume
      });
    }
  }, [navigation, perfume]);
  // =============================================================

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
      Alert.alert("Sucesso!", `${perfume?.name} foi adicionado ao carrinho.`);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      Alert.alert("Erro", "Não foi possível adicionar o item ao carrinho.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!perfume) {
    return <Text style={styles.errorText}>Perfume não encontrado.</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={{ uri: perfume.image.replace('127.0.0.1', '192.168.0.101') }} 
        style={styles.perfumeImage} 
      />
      
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{perfume.name}</Text>
        <Text style={styles.brand}>{perfume.brand}</Text>
        <Text style={styles.price}>R$ {perfume.price}</Text>
        <Text style={styles.description}>{perfume.description}</Text>
        
        <View style={styles.buttonContainer}>
          <Button title="Adicionar ao Carrinho" onPress={handleAddToCart} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', marginTop: 20, fontSize: 18, color: 'red' },
  perfumeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  brand: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 20,
  },
});