// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';

const PRETO_FUNDO = '#121212';
const DOURADO_ATIVO = '#FFD700';
const CINZA_INATIVO = '#8e8e93';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DOURADO_ATIVO,
        tabBarInactiveTintColor: CINZA_INATIVO,
        tabBarStyle: {
          backgroundColor: PRETO_FUNDO,
          borderTopWidth: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index" // Catálogo
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart" // Carrinho
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="shopping-cart" color={color} />,
        }}
      />
      {/* ===== NOVA ABA ADICIONADA AQUI ===== */}
      <Tabs.Screen
        name="profile" // Aponta para profile.tsx
        options={{
          title: 'Perfil', // Texto da aba
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />, // Ícone de usuário
        }}
      />
      {/* ==================================== */}
    </Tabs>
  );
}