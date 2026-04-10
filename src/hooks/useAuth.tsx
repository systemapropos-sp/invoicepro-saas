import React, { useState, useEffect, createContext, useContext } from 'react';
import type { User, AuthResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'invoicefly_token';
const USER_KEY = 'invoicefly_user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string, companyName?: string) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database helpers
const getUsers = (): (User & { password?: string })[] => {
  const data = localStorage.getItem('invoicefly_users');
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users: (User & { password?: string })[]) => {
  localStorage.setItem('invoicefly_users', JSON.stringify(users));
};

// Initialize demo user
const initDemoUser = () => {
  const users = getUsers();
  if (users.length === 0) {
    saveUsers([{
      id: 1,
      name: 'Demo User',
      email: 'demo@invoicefly.com',
      password: 'password',
      company_name: 'Demo Company',
      company_address: '123 Business St\nNew York, NY 10001',
      company_phone: '+1 555-123-4567',
      company_email: 'contact@democompany.com'
    }]);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize demo user
  initDemoUser();

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
      
      setToken(mockToken);
      setUser(userWithoutPassword);
      
      return { success: true, token: mockToken, user: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (name: string, email: string, password: string, companyName?: string): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const newUser: User & { password: string } = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1,
      name,
      email,
      password,
      company_name: companyName || ''
    };
    
    users.push(newUser);
    saveUsers(users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
    
    setToken(mockToken);
    setUser(userWithoutPassword);
    
    return { success: true, token: mockToken, user: userWithoutPassword };
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    
    // Update in users list too
    const users = getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index >= 0) {
      users[index] = { ...users[index], ...updatedUser };
      saveUsers(users);
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser
  };

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
