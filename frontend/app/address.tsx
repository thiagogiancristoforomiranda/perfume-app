// app/address.tsx (caminho corrigido)
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Alert, StatusBar, Modal, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';

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
};

// --- Tipagem Corrigida ---
// Definindo uma interface mínima para o usuário (para corrigir erros de tipo)
interface User {
  id: number;
  [key: string]: any; // Permite outras propriedades
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

export default function AddressScreen() {
  // Aplicando a tipagem correta ao 'user' vindo do AuthContext
  const { signed, user } = useAuth() as { signed: boolean; user: User | null };
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false,
  });

  // Buscar endereços
  const fetchAddresses = async () => {
    if (!signed) return;

    try {
      setLoading(true);
      console.log('Buscando endereços...');
      
      let response;
      try {
        response = await api.get('/addresses/');
      } catch (error: any) { // --- Correção de tipo aqui ---
        console.log('Endpoint /addresses/ falhou, tentando /user/addresses/');
        response = await api.get('/user/addresses/');
      }
      
      console.log('Endereços encontrados:', response.data);
      setAddresses(response.data);
    } catch (error: any) { // --- Correção de tipo aqui ---
      console.error('Erro ao buscar endereços:', error.response?.data || error.message);
      
      // 👇 ===== ALERTA "EM DESENVOLVIMENTO" REMOVIDO ===== 👇
      if (error.response?.status === 404) {
        console.log('API de endereço não encontrada (404), usando fallback local.');
        setAddresses([]); // Começar com array vazio
        // O Alerta de "Funcionalidade em desenvolvimento" foi removido.
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os endereços.');
      }
      // ===================================================
      
    } finally {
      setLoading(false);
    }
  };

  // Atualizar quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [signed])
  );

  // Limpar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
      is_default: false,
    });
    setEditingAddress(null);
  };

  // Abrir modal para adicionar/editar
  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (address: Address) => {
    setFormData({
      name: address.name,
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      is_default: address.is_default,
    });
    setEditingAddress(address);
    setModalVisible(true);
  };

  // Salvar endereço
  const handleSaveAddress = async () => {
    try {
      if (!formData.name || !formData.street || !formData.number || 
          !formData.neighborhood || !formData.city || !formData.state || !formData.zip_code) {
        Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
        return;
      }

      console.log('Salvando endereço:', formData);

      // Dados para enviar à API (a tipagem de 'user' agora corrige erros aqui)
      const addressData = {
        ...formData,
        user_id: user?.id 
      };

      if (editingAddress) {
        // Editar endereço existente
        try {
          await api.put(`/addresses/${editingAddress.id}/`, addressData);
        } catch (error: any) { // --- Correção de tipo aqui ---
          await api.put(`/user/addresses/${editingAddress.id}/`, addressData);
        }
        Alert.alert('Sucesso', 'Endereço atualizado com sucesso!');
      } else {
        // Criar novo endereço
        try {
          await api.post('/addresses/', addressData);
        } catch (error: any) { // --- Correção de tipo aqui ---
          await api.post('/user/addresses/', addressData);
        }
        Alert.alert('Sucesso', 'Endereço adicionado com sucesso!');
      }

      setModalVisible(false);
      fetchAddresses();
      resetForm();
    } catch (error: any) { // --- Correção de tipo aqui ---
      console.error('Erro ao salvar endereço:', error.response?.data || error.message);
      
      // Se a API não existe, salvar localmente
      if (error.response?.status === 404) {
        const newAddress: Address = {
          id: Date.now(), // ID temporário
          ...formData
        };
        
        if (editingAddress) {
          // Atualizar endereço existente no estado local
          setAddresses(prev => prev.map(addr => 
            addr.id === editingAddress.id ? newAddress : addr
          ));
          Alert.alert('Sucesso', 'Endereço atualizado localmente!');
        } else {
          // Adicionar novo endereço ao estado local
          setAddresses(prev => [...prev, newAddress]);
          Alert.alert('Sucesso', 'Endereço adicionado localmente!');
        }
        
        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o endereço.');
      }
    }
  };

  // Deletar endereço
  const handleDeleteAddress = async (address: Address) => {
    Alert.alert(
      "Excluir Endereço",
      `Tem certeza que deseja excluir o endereço "${address.name}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: async () => {
            try {
              // Tentar deletar na API
              try {
                await api.delete(`/addresses/${address.id}/`);
              } catch (error: any) { // --- Correção de tipo aqui ---
                await api.delete(`/user/addresses/${address.id}/`);
              }
              
              // Atualizar lista
              fetchAddresses();
              Alert.alert('Sucesso', 'Endereço excluído com sucesso!');
            } catch (error: any) { // --- Correção de tipo aqui ---
              console.error('Erro ao excluir endereço:', error.response?.data || error.message);
              
              // Se API não existe, deletar localmente
              if (error.response?.status === 404) {
                setAddresses(prev => prev.filter(addr => addr.id !== address.id));
                Alert.alert('Sucesso', 'Endereço excluído localmente!');
              } else {
                Alert.alert('Erro', 'Não foi possível excluir o endereço.');
              }
            }
          }
        }
      ]
    );
  };

  // Definir como padrão
  const handleSetDefault = async (address: Address) => {
    try {
      try {
        await api.post(`/addresses/${address.id}/set_default/`);
      } catch (error: any) { // --- Correção de tipo aqui ---
        await api.post(`/user/addresses/${address.id}/set_default/`);
      }
      
      fetchAddresses();
      Alert.alert('Sucesso', 'Endereço definido como padrão!');
    } catch (error: any) { // --- Correção de tipo aqui ---
      console.error('Erro ao definir endereço padrão:', error.response?.data || error.message);
      
      // Se API não existe, definir padrão localmente
      if (error.response?.status === 404) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          is_default: addr.id === address.id
        })));
        Alert.alert('Sucesso', 'Endereço definido como padrão localmente!');
      } else {
        Alert.alert('Erro', 'Não foi possível definir o endereço como padrão.');
      }
    }
  };

  // Componente de Endereço
  const AddressCard = ({ address }: { address: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTitleContainer}>
          <Text style={styles.addressName}>{address.name}</Text>
          {address.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>PADRÃO</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => openEditModal(address)}
          >
            <Ionicons name="create-outline" size={18} color={CORES.dourado} />
          </Pressable>
          <Pressable 
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(address)}
          >
            <Ionicons name="trash-outline" size={18} color={CORES.erro} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.addressText}>
        {address.street}, {address.number}
        {address.complement && `, ${address.complement}`}
      </Text>
      <Text style={styles.addressText}>
        {address.neighborhood}, {address.city} - {address.state}
      </Text>
      <Text style={styles.addressText}>CEP: {address.zip_code}</Text>

      {!address.is_default && (
        <Pressable 
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(address)}
        >
          <Text style={styles.setDefaultText}>Definir como padrão</Text>
        </Pressable>
      )}
    </View>
  );

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
          <Text style={styles.headerTitle}>Endereços</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color={CORES.dourado} />
          <Text style={styles.emptyStateTitle}>Acesso não autorizado</Text>
          <Text style={styles.emptyStateText}>Faça login para gerenciar seus endereços</Text>
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
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={CORES.textoPrincipal} />
        </Pressable>
        <Text style={styles.headerTitle}>Meus Endereços</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Lista de Endereços */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={CORES.dourado} />
            <Text style={styles.emptyStateTitle}>Nenhum endereço cadastrado</Text>
            <Text style={styles.emptyStateText}>Adicione seu primeiro endereço para facilitar suas compras</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))
        )}
      </ScrollView>

      {/* Botão Adicionar */}
      <Pressable 
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={24} color={CORES.botaoTexto} />
        <Text style={styles.addButtonText}>ADICIONAR ENDEREÇO</Text>
      </Pressable>

      {/* Modal de Adicionar/Editar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
              </Text>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={CORES.textoPrincipal} />
              </Pressable>
            </View>

            {/* Formulário */}
            <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
              {/* Apelido do Endereço */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Apelido do Endereço <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
                  placeholder="Ex: Casa, Trabalho..."
                  placeholderTextColor={CORES.textoSecundario}
                  selectionColor={CORES.dourado}
                />
              </View>

              {/* Rua */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Rua <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.street}
                  onChangeText={(text) => setFormData(prev => ({...prev, street: text}))}
                  placeholder="Nome da rua"
                  placeholderTextColor={CORES.textoSecundario}
                  selectionColor={CORES.dourado}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>
                    Número <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.number}
                    onChangeText={(text) => setFormData(prev => ({...prev, number: text}))}
                    placeholder="Nº"
                    placeholderTextColor={CORES.textoSecundario}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 2 }]}>
                  <Text style={styles.inputLabel}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.complement}
                    onChangeText={(text) => setFormData(prev => ({...prev, complement: text}))}
                    placeholder="Apto, Bloco, etc."
                    placeholderTextColor={CORES.textoSecundario}
                  />
                </View>
              </View>

              {/* Bairro */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Bairro <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.neighborhood}
                  onChangeText={(text) => setFormData(prev => ({...prev, neighborhood: text}))}
                  placeholder="Nome do bairro"
                  placeholderTextColor={CORES.textoSecundario}
                  selectionColor={CORES.dourado}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>
                    Cidade <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(text) => setFormData(prev => ({...prev, city: text}))}
                    placeholder="Cidade"
                    placeholderTextColor={CORES.textoSecundario}
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>
                    Estado <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.state}
                    onChangeText={(text) => setFormData(prev => ({...prev, state: text}))}
                    placeholder="UF"
                    placeholderTextColor={CORES.textoSecundario}
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1.5 }]}>
                  <Text style={styles.inputLabel}>
                    CEP <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={formData.zip_code}
                    onChangeText={(text) => setFormData(prev => ({...prev, zip_code: text}))}
                    placeholder="00000-000"
                    placeholderTextColor={CORES.textoSecundario}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Checkbox Padrão */}
              <Pressable 
                style={styles.checkboxContainer}
                onPress={() => setFormData(prev => ({...prev, is_default: !prev.is_default}))}
              >
                <View style={[
                  styles.checkbox,
                  formData.is_default && styles.checkboxChecked
                ]}>
                  {formData.is_default && (
                    <Ionicons name="checkmark" size={16} color={CORES.fundo} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Definir como endereço padrão</Text>
              </Pressable>
            </ScrollView>

            {/* Botões do Modal */}
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveAddress}
              >
                <Text style={styles.saveButtonText}>
                  {editingAddress ? 'ATUALIZAR' : 'SALVAR'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
  // Endereço Card
  addressCard: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CORES.borda,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '700',
    color: CORES.textoPrincipal,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: CORES.dourado,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: CORES.fundo,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  addressText: {
    fontSize: 14,
    color: CORES.textoSecundario,
    marginBottom: 4,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CORES.dourado,
    borderRadius: 8,
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: CORES.dourado,
  },
  // Botão Adicionar
  addButton: {
    backgroundColor: CORES.dourado,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
    shadowColor: CORES.dourado,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: CORES.botaoTexto,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Estados Vazios
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
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CORES.fundoCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CORES.textoPrincipal,
  },
  closeButton: {
    padding: 4,
  },
  formScrollView: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // Inputs
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CORES.textoPrincipal,
    marginBottom: 8,
  },
  required: {
    color: CORES.erro,
  },
  input: {
    backgroundColor: CORES.card,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: CORES.textoPrincipal,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: CORES.dourado,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: CORES.dourado,
  },
  checkboxLabel: {
    fontSize: 14,
    color: CORES.textoPrincipal,
    fontWeight: '500',
  },
  // Botões do Modal
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: CORES.borda,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CORES.textoSecundario,
  },
  saveButton: {
    backgroundColor: CORES.dourado,
  },
  cancelButtonText: {
    color: CORES.textoSecundario,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonText: {
    color: CORES.botaoTexto,
    fontSize: 14,
    fontWeight: '600',
  },
});