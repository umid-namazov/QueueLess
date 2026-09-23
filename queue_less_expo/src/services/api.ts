import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');
const API_MODE = process.env.EXPO_PUBLIC_API_MODE ?? 'mock';
const useMockApi = API_MODE !== 'api';

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      error.message = detail;
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      Toast.show({
        type: 'error',
        text1: 'Sessiya yakunlandi',
        text2: 'Iltimos, qaytadan tizimga kiring',
      });
    } else if (error.response?.status >= 500) {
      Toast.show({
        type: 'error',
        text1: 'Server xatoligi',
        text2: "Keyinroq qayta urinib ko'ring",
      });
    } else if (error.message === 'Network Error') {
      Toast.show({
        type: 'error',
        text1: 'Internet mavjud emas',
        text2: 'Tarmoq ulanishini tekshiring',
      });
    }
    return Promise.reject(error);
  }
);

async function request<T>(path: string, options: { method?: 'get' | 'post' | 'delete' | 'put'; data?: unknown; token?: string } = {}) {
  const response = await client.request<T>({
    url: path,
    method: options.method ?? 'get',
    data: options.data,
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
  });
  return response.data;
}

export async function apiLogin(phone: string, password: string) {
  if (useMockApi) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { access_token: 'mock_jwt_token_12345' };
  }

  const body = new URLSearchParams({ username: phone, password });
  return request<{ access_token: string }>('/auth/login', {
    method: 'post',
    data: body.toString(),
  });
}

export async function apiRegister(fullName: string, phone: string, password: string) {
  if (useMockApi) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { access_token: 'mock_jwt_token_12345' };
  }

  await request('/auth/register', {
    method: 'post',
    data: { full_name: fullName, phone, password },
  });
  return apiLogin(phone, password);
}

export interface Branch {
  id: number;
  name: string;
  category: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  avg_service_minutes: number;
  working_hours: string;
  current_waiting_count: number;
  estimated_wait_minutes: number;
}

export async function apiGetBranches(): Promise<Branch[]> {
  if (useMockApi) return [];
  return request<Branch[]>('/branches', { method: 'get' });
}

export async function apiGetBranch(id: number): Promise<Branch> {
  return request<Branch>(`/branches/${id}`, { method: 'get' });
}

export async function apiGetBranchQueue(id: number): Promise<QueueItem[]> {
  if (useMockApi) return [];
  return request<QueueItem[]>(`/branches/${id}/queue`, { method: 'get' });
}

export async function apiRequestBranch(data: any): Promise<Branch> {
  return request<Branch>('/branches/request', { method: 'post', data });
}

export async function apiGetPendingBranches(): Promise<Branch[]> {
  return request<Branch[]>('/branches/admin/pending', { method: 'get' });
}

export async function apiApproveBranch(id: number): Promise<Branch> {
  return request<Branch>(`/branches/admin/${id}/approve`, { method: 'post' });
}

export interface User {
  id: number;
  full_name: string;
  phone: string;
  is_admin?: boolean;
}

export async function apiGetMe(): Promise<User> {
  return request<User>('/users/me', { method: 'get' });
}

export interface QueueItem {
  id: number;
  branch_id: number;
  queue_number: number;
  status: 'waiting' | 'confirmed' | 'completed' | 'cancelled';
  people_ahead: number;
  estimated_wait_minutes: number;
  qr_code?: string;
  branch_name?: string; // We might need to manually populate this if backend doesn't return it
}

export async function apiGetMyQueue(): Promise<QueueItem[]> {
  return request<QueueItem[]>('/queue/my', { method: 'get' });
}

export async function apiBookQueue(branchId: number): Promise<any> {
  return request('/queue/book', { method: 'post', data: { branch_id: branchId } });
}

export async function apiCancelQueue(bookingId: number): Promise<any> {
  return request(`/queue/${bookingId}`, { method: 'delete' });
}