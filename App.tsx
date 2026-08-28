import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardScreen } from './src/presentation/screens/DashboardScreen';

// Inicializar el cliente global de TanStack React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <DashboardScreen />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
