// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons'; // Biblioteca de ícones

export default function TabLayout() {
  return (
    // Aqui podemos configurar a cor do ícone e texto da aba ativa
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007BFF' }}>
      <Tabs.Screen
        name="index" // Aponta para o arquivo index.tsx (Catálogo)
        options={{
          title: 'Catálogo', // O texto que aparece na aba
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart" // CORREÇÃO: Aponta para o arquivo cart.tsx
        options={{
          title: 'Carrinho', // CORREÇÃO: O texto correto da aba
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="shopping-cart" color={color} />,
        }}
      />
    </Tabs>
  );
}