import { Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator, Alert, Button, Pressable } from 'react-native';
import api from '../../src/services/api'; 

// Definindo um tipo para o objeto Perfume
interface Perfume {
  id: number;
  name: string;
  brand: string;
  price: string;
}

export default function HomeScreen() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);

  // Função que busca os dados na API
  async function fetchPerfumes() {
    try {
      const response = await api.get('/perfumes/');
      setPerfumes(response.data);
    } catch (error) {
      console.error("Erro ao buscar perfumes:", error);
      Alert.alert("Erro de Conexão", "Não foi possível buscar os perfumes. Verifique se o servidor backend está rodando.");
    } finally {
      setLoading(false);
    }
  }

  // useEffect para chamar a função fetchPerfumes() assim que a tela abrir
  useEffect(() => {
    fetchPerfumes();
  }, []);

  const renderPerfume = ({ item }: { item: Perfume }) => (
    <Link
      href={{
        pathname: "/perfumes/[id]",
        params: { id: item.id }
      }}
      asChild
    >
      <Pressable>
        <View style={styles.itemContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemBrand}>{item.brand}</Text>
          <Text style={styles.itemPrice}>R$ {item.price}</Text>
        </View>
      </Pressable>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Catálogo de Perfumes</Text>

      {/* ===== BOTÃO DE LOGIN ADICIONADO AQUI ===== */}
      <Link href="/login" style={styles.loginLink}>
        <Text style={styles.loginLinkText}>Fazer Login ou Criar Conta</Text>
      </Link>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={perfumes}
          renderItem={renderPerfume}
          keyExtractor={item => item.id.toString()}
          refreshing={loading}
          onRefresh={fetchPerfumes}
        />
      )}
    </SafeAreaView>
  );
}

// Estilos dos componentes
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        elevation: 3,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemBrand: {
        fontSize: 14,
        color: 'gray',
        marginTop: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        color: '#007BFF',
        textAlign: 'right',
    },
    // ===== ESTILOS DO BOTÃO DE LOGIN ADICIONADOS AQUI =====
    loginLink: {
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 12,
        backgroundColor: '#007BFF',
        borderRadius: 8,
        alignItems: 'center',
    },
    loginLinkText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});