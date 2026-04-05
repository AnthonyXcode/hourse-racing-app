import { createApiClient, type ApiClient } from '@horse-racing/api-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STRAPI_URL = process.env.EXPO_PUBLIC_STRAPI_URL || 'http://localhost:1337/api';
const TOKEN_KEY = 'auth_jwt';

let clientInstance: ApiClient | null = null;

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
  clientInstance = null;
}

export async function removeAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  clientInstance = null;
}

export async function getApiClient(): Promise<ApiClient> {
  if (clientInstance) return clientInstance;
  const token = await getAuthToken();
  clientInstance = createApiClient({
    baseURL: STRAPI_URL,
    ...(token ? { token } : {}),
  });
  return clientInstance;
}

export function resetApiClient(): void {
  clientInstance = null;
}
