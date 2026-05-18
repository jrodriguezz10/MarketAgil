import axios from 'axios';
import { getToken } from '../utils/auth';
import { API_URL } from '../utils/apiBase';
import { AuthResponse, Categoria, CategoriaPayload, DashboardStats, LoginData } from '../types';

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

export const getCategorias = async (): Promise<Categoria[]> => {
  const res = await axios.get(`${API_URL}/categorias`, {
    headers: buildAuthHeaders(getToken())
  });
  return res.data;
};

export const createCategoria = async (payload: CategoriaPayload): Promise<Categoria> => {
  const res = await axios.post(`${API_URL}/categorias`, payload, {
    headers: buildAuthHeaders(getToken())
  });
  return res.data;
};

export const updateCategoria = async (id: number, payload: CategoriaPayload): Promise<Categoria> => {
  const res = await axios.put(`${API_URL}/categorias/${id}`, payload, {
    headers: buildAuthHeaders(getToken())
  });
  return res.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias/${id}`, {
    headers: buildAuthHeaders(getToken())
  });
};
