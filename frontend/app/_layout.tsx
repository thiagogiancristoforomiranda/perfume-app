// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext'; // Importe nosso AuthProvider

// Este é o layout principal do aplicativo.
// A lógica de fontes e splash screen pode ser adicionada aqui depois se necessário.
export default function RootLayout() {
  
  // Adicionando um log para ter certeza que este arquivo está rodando.
  console.log("--- O ARQUIVO _layout.tsx FOI EXECUTADO ---"); 

  return (
    // O AuthProvider deve envolver toda a navegação para que o
    // estado de login esteja disponível em todas as telas.
    <AuthProvider>
      <Stack>
        {/* A rota principal são as abas (tabs), que não mostram um cabeçalho aqui */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Rota para a tela de login */}
        <Stack.Screen name="login" options={{ title: 'Faça seu Login' }} />
        
        {/* Rota para a tela modal que já existia */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </AuthProvider>
  );
}