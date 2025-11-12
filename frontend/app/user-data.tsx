// app/user-data.tsx
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView, Alert, StatusBar, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';

// Paleta de cores
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

// --- Tipagens ATUALIZADAS ---
interface ProfileData {
  phone?: string;
  cpf?: string;
  birth_date?: string | null; // Pode ser null
  gender?: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: ProfileData; // Perfil aninhado
  [key: string]: any;
}

interface Order {
  id: number;
  [key: string]: any;
}

interface Favorite {
  id: number;
  [key: string]: any;
}

export default function UserDataScreen() {
  const { signed, user } = useAuth() as { signed: boolean; user: { id: number; name: string; email: string; } | null };
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    gender: '',
  });

  // Buscar dados do usuário
  const fetchUserData = async () => {
    if (!signed) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // --- CORREÇÃO DE URL E LÓGICA ---
      // Corrigido de /user/profile/ para /auth/profile/
      const response = await api.get('/auth/profile/');
      const data = response.data;
      
      setUserData(data);
      setFormData({
        name: data.name || (user?.name || ''),
        email: data.email || (user?.email || ''),
        phone: data.profile?.phone || '',
        cpf: data.profile?.cpf || '',
        birth_date: data.profile?.birth_date || '', // Vem como AAAA-MM-DD
        gender: data.profile?.gender || '',
      });
      // --- FIM DA CORREÇÃO ---
      
      const ordersResponse = await api.get('/orders/');
      setOrders(ordersResponse.data);
      
      const favoritesResponse = await api.get('/favorites/');
      setFavorites(favoritesResponse.data);
      
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error.response?.data || error.message);
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: '', cpf: '', birth_date: '', gender: '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [signed, user])
  );

  const openEditModal = (field: string) => {
    setEditingField(field);
    setModalVisible(true);
  };

  // --- handleSaveData ATUALIZADO ---
  const handleSaveData = async () => {
    if (!editingField) return;
    try {
      let value: string | null = formData[editingField as keyof typeof formData];
      
      // Validação específica para Data de Nascimento
      if (editingField === 'birth_date' && value) {
         const parts = value.split('/');
         if (parts.length === 3 && parts[2].length === 4) {
           // Converte DD/MM/AAAA para AAAA-MM-DD
           value = `${parts[2]}-${parts[1]}-${parts[0]}`;
         } else if (value.split('-').length === 3 && value.split('-')[0].length === 4) {
           // Já está em AAAA-MM-DD, não faz nada
         } else {
            // Formato inválido
            Alert.alert('Erro no Formato', 'Para Data de Nascimento, use o formato DD/MM/AAAA.');
            return;
         }
      } else if (editingField === 'birth_date' && !value) {
          value = null; // Permite esvaziar o campo
      }

      const updateData = {
        [editingField]: value
      };

      // --- CORREÇÃO DE URL ---
      // Corrigido de /user/profile/ para /auth/profile/
      await api.put('/auth/profile/', updateData);
      
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      setModalVisible(false);
      setEditingField(null);
      fetchUserData();
      
    } catch (error: any) {
      console.error('Erro ao salvar dados:', error.response?.data || error.message);
      
      // --- CORREÇÃO DA MENSAGEM DE ERRO ---
      // Agora mostra o erro real do backend (ex: "no such table")
      const backendError = error.response?.data?.error;
      Alert.alert(
        'Erro ao Salvar',
        backendError || 'Não foi possível salvar os dados. Tente novamente.'
      );
      // --- FIM DA CORREÇÃO ---
    }
  };
  // --- FIM DA ATUALIZAÇÃO ---

  // Funções de formatação
  const formatCPF = (cpf: string) => !cpf ? '' : cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const formatPhone = (phone: string) => !phone || phone.length < 10 ? phone : (phone.length === 11 ? phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3'));
  const formatDate = (date: string) => {
    if (!date) return '';
    // Converte AAAA-MM-DD para DD/MM/AAAA
    const parts = date.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return date; // Retorna o formato original (ex: DD/MM/AAAA)
  };

  const DataItem = ({ icon, label, value, onEdit, isLast = false }: any) => (
    <Pressable style={[styles.dataItem, isLast && styles.dataItemLast]} onPress={onEdit}>
      <View style={styles.dataItemLeft}>
        <View style={styles.dataIconContainer}>{icon}</View>
        <View style={styles.dataTextContainer}>
          <Text style={styles.dataLabel}>{label}</Text>
          <Text style={styles.dataValue}>
            {value || <Text style={styles.emptyText}>Não informado</Text>}
          </Text>
        </View>
      </View>
      <Ionicons name="create-outline" size={20} color={CORES.dourado} />
    </Pressable>
  );

  if (!signed) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={CORES.textoPrincipal} />
          </Pressable>
          <Text style={styles.headerTitle}>Meus Dados</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={CORES.dourado} />
          <Text style={styles.emptyStateTitle}>Acesso não autorizado</Text>
          <Text style={styles.emptyStateText}>Faça login para visualizar seus dados</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CORES.fundo} />
      
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={CORES.textoPrincipal} />
        </Pressable>
        <Text style={styles.headerTitle}>Meus Dados</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={CORES.dourado} />
            <Text style={styles.loadingText}>Carregando dados...</Text>
          </View>
        ) : (
          <>
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              <DataItem icon={<Ionicons name="person-outline" size={22} color={CORES.dourado} />} label="Nome Completo" value={formData.name} onEdit={() => openEditModal('name')} />
              <DataItem icon={<Ionicons name="mail-outline" size={22} color={CORES.dourado} />} label="E-mail" value={formData.email} onEdit={() => openEditModal('email')} />
              <DataItem icon={<Ionicons name="call-outline" size={22} color={CORES.dourado} />} label="Telefone" value={formatPhone(formData.phone)} onEdit={() => openEditModal('phone')} />
              <DataItem icon={<Ionicons name="card-outline" size={22} color={CORES.dourado} />} label="CPF" value={formatCPF(formData.cpf)} onEdit={() => openEditModal('cpf')} />
              <DataItem icon={<Ionicons name="calendar-outline" size={22} color={CORES.dourado} />} label="Data de Nascimento" value={formatDate(formData.birth_date)} onEdit={() => openEditModal('birth_date')} />
              <DataItem icon={<Ionicons name="male-female-outline" size={22} color={CORES.dourado} />} label="Gênero" value={formData.gender} onEdit={() => openEditModal('gender')} isLast={true} />
            </View>
            
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Estatísticas da Conta</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="cube-outline" size={24} color={CORES.dourado} />
                  <Text style={styles.statNumber}>{orders.length}</Text>
                  <Text style={styles.statLabel}>Pedidos</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="heart-outline" size={24} color={CORES.dourado} />
                  <Text style={styles.statNumber}>{favorites.length}</Text>
                  <Text style={styles.statLabel}>Favoritos</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Editar {editingField === 'name' && 'Nome'}
                {editingField === 'email' && 'E-mail'}
                {editingField === 'phone' && 'Telefone'}
                {editingField === 'cpf' && 'CPF'}
                {editingField === 'birth_date' && 'Data de Nascimento'}
                {editingField === 'gender' && 'Gênero'}
              </Text>
              <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={CORES.textoPrincipal} />
              </Pressable>
            </View>
            <View style={styles.formContent}>
              {editingField === 'name' && <View style={styles.inputContainer}><Text style={styles.inputLabel}>Nome Completo</Text><TextInput style={styles.input} value={formData.name} onChangeText={(text) => setFormData(prev => ({...prev, name: text}))} placeholder="Digite seu nome completo" placeholderTextColor={CORES.textoSecundario} selectionColor={CORES.dourado} /></View>}
              {editingField === 'email' && <View style={styles.inputContainer}><Text style={styles.inputLabel}>E-mail</Text><TextInput style={styles.input} value={formData.email} onChangeText={(text) => setFormData(prev => ({...prev, email: text}))} placeholder="Digite seu e-mail" placeholderTextColor={CORES.textoSecundario} selectionColor={CORES.dourado} keyboardType="email-address" autoCapitalize="none" /></View>}
              {editingField === 'phone' && <View style={styles.inputContainer}><Text style={styles.inputLabel}>Telefone</Text><TextInput style={styles.input} value={formData.phone} onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))} placeholder="(11) 99999-9999" placeholderTextColor={CORES.textoSecundario} selectionColor={CORES.dourado} keyboardType="phone-pad" /></View>}
              {editingField === 'cpf' && <View style={styles.inputContainer}><Text style={styles.inputLabel}>CPF</Text><TextInput style={styles.input} value={formData.cpf} onChangeText={(text) => setFormData(prev => ({...prev, cpf: text}))} placeholder="000.000.000-00" placeholderTextColor={CORES.textoSecundario} selectionColor={CORES.dourado} keyboardType="numeric" /></View>}
              {editingField === 'birth_date' && <View style={styles.inputContainer}><Text style={styles.inputLabel}>Data de Nascimento</Text><TextInput style={styles.input} value={formData.birth_date} onChangeText={(text) => setFormData(prev => ({...prev, birth_date: text}))} placeholder="DD/MM/AAAA" placeholderTextColor={CORES.textoSecundario} selectionColor={CORES.dourado} keyboardType="numbers-and-punctuation" /></View>}
              {editingField === 'gender' && <View style={styles.inputContainer}><Text style={styles.inputLabel}>Gênero</Text><View style={styles.genderOptions}>{['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'].map((option) => (<Pressable key={option} style={[styles.genderOption, formData.gender === option && styles.genderOptionSelected]} onPress={() => setFormData(prev => ({...prev, gender: option}))}><Text style={[styles.genderOptionText, formData.gender === option && styles.genderOptionTextSelected]}>{option}</Text></Pressable>))}</View></View>}
            </View>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}><Text style={styles.cancelButtonText}>CANCELAR</Text></Pressable>
              <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleSaveData}><Text style={styles.saveButtonText}>SALVAR</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Estilos
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
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: CORES.textoSecundario,
  },
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
  dataSection: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    overflow: 'hidden',
  },
  statsSection: {
    backgroundColor: CORES.card,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    letterSpacing: 0.5,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  dataItemLast: {
    borderBottomWidth: 0,
  },
  dataItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  dataTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  dataLabel: {
    fontSize: 14,
    color: CORES.textoSecundario,
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
  },
  emptyText: {
    color: CORES.textoSecundario,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORES.dourado,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: CORES.textoSecundario,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: CORES.fundoCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  formContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: CORES.textoPrincipal,
    marginBottom: 8,
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
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 8,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: CORES.dourado,
    borderColor: CORES.dourado,
  },
  genderOptionText: {
    fontSize: 14,
    color: CORES.textoPrincipal,
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: CORES.fundo,
    fontWeight: '600',
  },
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