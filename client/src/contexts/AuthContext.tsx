import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  youtube_channel_id?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('videoVaultToken');
  });

  // Check authentication status
  const { data: authData, isLoading, error, refetch } = useQuery(
    ['auth', 'status'],
    () => api.get('/auth/status'),
    {
      enabled: !!token,
      retry: false,
      onError: () => {
        // Clear invalid token
        setToken(null);
        localStorage.removeItem('videoVaultToken');
      },
    }
  );

  const user = authData?.data?.authenticated ? authData.data.user : null;

  // Store token in localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('videoVaultToken', token);
    } else {
      localStorage.removeItem('videoVaultToken');
    }
  }, [token]);

  // Set auth header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = () => {
    // Redirect to backend auth endpoint
    window.location.href = '/api/auth/google';
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      localStorage.removeItem('videoVaultToken');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    token,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
