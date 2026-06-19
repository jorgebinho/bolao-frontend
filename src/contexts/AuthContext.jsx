// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    localStorage.setItem('@bolao:user', JSON.stringify(nextUser));
  }, []);

  const syncUser = useCallback((userData) => {
    setUser((currentUser) => {
      const nextUser = { ...(currentUser || {}), ...userData };
      localStorage.setItem('@bolao:user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  // Restaura sessão do localStorage
  useEffect(() => {
    const token = localStorage.getItem('@bolao:token');
    const storedUser = localStorage.getItem('@bolao:user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('@bolao:user');
        localStorage.removeItem('@bolao:token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('@bolao:token', data.token);
    persistUser(data.user);
    return data.user;
  }, [persistUser]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('@bolao:token', data.token);
    persistUser(data.user);
    return data.user;
  }, [persistUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('@bolao:token');
    localStorage.removeItem('@bolao:user');
    setUser(null);
  }, []);

  // Atualiza dados do usuário localmente (ex: após ganhar pontos)
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/profile');
      persistUser({
        id: data.profile.id,
        name: data.profile.name,
        email: data.profile.email,
        role: data.profile.role,
        points: data.profile.totalPoints,
      });
    } catch { /* Silencia erros de refresh */ }
  }, [persistUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
