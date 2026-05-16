import axios from 'axios';
import { getToken } from '../utils/auth';
import { API_URL } from '../utils/apiBase';
import { AuthResponse, DashboardStats, LoginData } from '../types';

const buildAuthHeaders = (token?: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const saveAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, credentials);
    const { token, user } = res.data;
    saveAuthToken(token);
    return { token, user };
  } catch (error) {
    throw new Error(getAuthErrorMessage(error, 'Error de autenticación'));
  }
};

export const loginWithGoogle = async (credential: string): Promise<AuthResponse> => {
  try {
    const res = await axios.post(`${API_URL}/auth/google`, { credential });
    const { token, user } = res.data;
    saveAuthToken(token);
    return { token, user };
  } catch (error) {
    throw new Error(getAuthErrorMessage(error, 'Continúa con un correo válido.'));
  }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await axios.get(`${API_URL}/dashboard/stats`, {
    headers: buildAuthHeaders(getToken())
  });
  return res.data;
};
