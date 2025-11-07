
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppData, NavItem } from '../types';
import { INITIAL_APP_DATA, STORAGE_KEY } from '../constants';
import { encryptData, decryptData } from '../services/cryptoService';

interface AppContextType {
  isAuthenticated: boolean;
  appData: AppData | null;
  isLoading: boolean;
  error: string | null;
  activeNav: NavItem;
  
  login: (password: string) => Promise<void>;
  logout: () => void;
  register: (password: string) => Promise<void>;
  updateAppData: (data: AppData) => Promise<void>;
  resetApp: () => Promise<void>;
  setActiveNav: (nav: NavItem) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [passwordKey, setPasswordKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');

  const saveData = useCallback(async (data: AppData, password?: string) => {
    const key = password || passwordKey;
    if (!key) {
      throw new Error("No password key available for saving data.");
    }
    const encryptedData = await encryptData(data, key);
    localStorage.setItem(STORAGE_KEY, encryptedData);
  }, [passwordKey]);

  const login = async (password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const encryptedData = localStorage.getItem(STORAGE_KEY);
      if (!encryptedData) {
        throw new Error("No data found. Please register first.");
      }
      const decryptedData = await decryptData<AppData>(encryptedData, password);
      setAppData(decryptedData);
      setPasswordKey(password);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your password.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await saveData(INITIAL_APP_DATA, password);
      setAppData(INITIAL_APP_DATA);
      setPasswordKey(password);
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAppData(null);
    setPasswordKey(null);
    setActiveNav('dashboard');
  };
  
  const updateAppData = async (data: AppData) => {
    setAppData(data);
    await saveData(data);
  };

  const resetApp = async () => {
    if (window.confirm("Are you sure? This will permanently delete all your data.")) {
        localStorage.removeItem(STORAGE_KEY);
        logout();
    }
  };

  const value = {
    isAuthenticated,
    appData,
    isLoading,
    error,
    activeNav,
    login,
    logout,
    register,
    updateAppData,
    resetApp,
    setActiveNav,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
