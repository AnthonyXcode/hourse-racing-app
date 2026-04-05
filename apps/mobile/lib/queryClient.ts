import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Persister } from '@tanstack/react-query-persist-client';

const CACHE_KEY = 'REACT_QUERY_CACHE';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
    },
  },
});

export const asyncStoragePersister: Persister = {
  persistClient: async (client) => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  },
  removeClient: async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
  },
};
