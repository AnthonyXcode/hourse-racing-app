import { OpenAPI, request, type CancelablePromise } from '@horse-racing/api-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STRAPI_URL = process.env.EXPO_PUBLIC_STRAPI_URL || 'http://localhost:1337/api';
const TOKEN_KEY = 'auth_jwt';

let _initialized = false;

/**
 * Configure the shared OpenAPI client singleton.
 * Safe to call multiple times — only the first call takes effect.
 * Must be called before any generated service (AnalysisService, etc.) is used.
 */
export function initApi() {
  if (_initialized) return;
  OpenAPI.BASE = STRAPI_URL;
  OpenAPI.TOKEN = async () => {
    const token = await getAuthToken();
    return token ?? '';
  };
  _initialized = true;
}

// Auto-init on import so existing code keeps working.
initApi();

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
}

export async function removeAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

/**
 * Strapi content-type query helpers built on the generated OpenAPI `request`.
 */
export const strapi = {
  find<T = any>(
    contentType: string,
    params?: {
      filters?: Record<string, unknown>;
      populate?: string | string[] | Record<string, unknown>;
      sort?: string | string[];
      pagination?: { page?: number; pageSize?: number; start?: number; limit?: number };
      fields?: string[];
      locale?: string;
    },
  ): CancelablePromise<T> {
    return request(OpenAPI, {
      method: 'GET',
      url: `/${contentType}`,
      query: params as Record<string, unknown>,
    });
  },

  findOne<T = any>(
    contentType: string,
    id: number | string,
    params?: { populate?: string | Record<string, unknown> },
  ): CancelablePromise<T> {
    return request(OpenAPI, {
      method: 'GET',
      url: `/${contentType}/{id}`,
      path: { id: String(id) },
      query: params as Record<string, unknown>,
    });
  },

  post<T = any>(url: string, body?: unknown): CancelablePromise<T> {
    return request(OpenAPI, {
      method: 'POST',
      url,
      body,
      mediaType: 'application/json',
    });
  },

  get<T = any>(url: string, query?: Record<string, unknown>): CancelablePromise<T> {
    return request(OpenAPI, {
      method: 'GET',
      url,
      query,
    });
  },
};
