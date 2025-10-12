import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ApiResponse } from '../types';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (email: string, password: string, username: string) => Promise<ApiResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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
  children: ReactNode;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 配置axios默认设置
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<ApiResponse> => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { success: true, data: userData };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '登录失败',
      };
    }
  };

  const register = async (email: string, password: string, username: string): Promise<ApiResponse> => {
    try {
      const response = await axios.post('/auth/register', { email, password, username });
      const { token, user: userData } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { success: true, data: userData };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || '注册失败',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};