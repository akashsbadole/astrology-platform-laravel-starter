import axios, { AxiosError } from 'axios';
import { clearSession, getToken } from '@/lib/session';

/**
 * Base URL of the Laravel backend.
 * - Android emulator: 10.0.2.2 maps to the host machine's localhost
 * - iOS simulator / web: localhost works directly
 * - Physical device: set EXPO_PUBLIC_API_URL to your LAN IP, e.g.
 *   EXPO_PUBLIC_API_URL=http://192.168.1.20:8000/api
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearSession();
    }
    return Promise.reject(error);
  },
);

/** Extract a human-friendly message from any error (axios or Laravel validation). */
export function apiErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const laravelErrors = err.response?.data?.errors;
  if (laravelErrors) {
    const first = Object.values(laravelErrors)[0];
    if (first?.length) return first[0];
  }
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
  if (!err.response) return 'Cannot reach the server. Is the Laravel app running?';
  return err.message || 'Something went wrong.';
}

export default api;
