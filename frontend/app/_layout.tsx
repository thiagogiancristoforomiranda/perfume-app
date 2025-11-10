// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
// --- NOVAS IMPORTAÇÕES ---
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
// -------------------------

// Impede a splash screen de esconder antes das fontes carregarem
SplashScreen.preventAutoHideAsync(); 

// ===== CORES DO TEMA PARA O CABEÇALHO =====
const CORES = {
  fundo: '#121212',
  textoPrincipal: '#FFFFFF',
};
// ===========================================

export default function RootLayout() {
  // --- CARREGAMENTO DAS FONTES ---
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync(); // Esconde a splash screen quando pronto
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Não renderiza nada até a fonte carregar (ou dar erro)
  }
  // -----------------------------

  return (
    <AuthProvider>
      {/* Aplicando um estilo padrão para todos os cabeçalhos */}
      <Stack screenOptions={{
        headerStyle: { backgroundColor: CORES.fundo },
        headerTintColor: CORES.textoPrincipal,
        headerTitleStyle: { color: CORES.textoPrincipal },
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        <Stack.Screen 
          name="login" 
          options={{ title: 'Faça seu Login' }} 
        />

        <Stack.Screen 
          name="register" 
          options={{ 
            title: 'Faça o seu registro' 
          }} 
        />
        
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />

        {/* ===== ROTAS SEM CABEÇALHO ADICIONADAS AQUI ===== */}
        <Stack.Screen 
          name="address" // Movemos o arquivo para app/address.tsx
          options={{ 
            headerShown: false // Esconde o cabeçalho padrão
          }} 
        />
        <Stack.Screen 
          name="user-data" // O arquivo app/user-data.tsx
          options={{ 
            headerShown: false // Esconde o cabeçalho padrão
          }} 
        />
        {/* ================================================== */}

      </Stack>
    </AuthProvider>
  );
}