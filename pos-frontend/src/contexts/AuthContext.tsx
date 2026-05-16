import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginData } from '../types';
import { login as apiLogin, loginWithGoogle as apiLoginWithGoogle } from '../services/api';
import { getUserPermissionsForId, setUserPermissionsForId } from '../utils/userPermissionsMap';

type LoginResult = { ok: boolean; message?: string; user?: User };

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginData) => Promise<LoginResult>;
  loginWithGoogle: (credential: string) => Promise<LoginResult>;
  logout: () => void;
  updateUser: (user: User) => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: false,
  login: async () => ({ ok: false }),
  loginWithGoogle: async () => ({ ok: false }),
  logout: () => {},
  updateUser: () => {},
  user: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      try {
        const parsedUser = JSON.parse(userData) as User;
        const localPermissions = getUserPermissionsForId(parsedUser?.id);
        setUser({
          ...parsedUser,
          permisos: localPermissions || parsedUser?.permisos || null
        });
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const persistAuthenticatedUser = (authenticatedUser: User) => {
    const localPermissions = getUserPermissionsForId(authenticatedUser?.id);
    const normalizedUser = {
      ...authenticatedUser,
      permisos: localPermissions || authenticatedUser?.permisos || null
    };
    if (normalizedUser.id && normalizedUser.permisos) {
      setUserPermissionsForId(normalizedUser.id, normalizedUser.permisos);
    }
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setIsAuthenticated(true);
    setUser(normalizedUser);
  };

  const login = async (credentials: LoginData) => {
    try {
      const { user } = await apiLogin(credentials);
      persistAuthenticatedUser(user);
      return { ok: true, user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      return { ok: false, message };
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const { user } = await apiLoginWithGoogle(credential);
      persistAuthenticatedUser(user);
      return { ok: true, user };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Continúa con un correo válido.';
      return { ok: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    if (updatedUser.id && updatedUser.permisos) {
      setUserPermissionsForId(updatedUser.id, updatedUser.permisos);
    }
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, loginWithGoogle, logout, updateUser, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
