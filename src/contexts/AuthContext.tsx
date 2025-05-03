import React, { createContext, useContext, useState, useEffect } from 'react';
import { Designer } from '../types';
import { useDesigners } from './DesignersContext';

type AuthContextType = {
  currentUser: Designer | null;
  login: (designerId: string, password?: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  validatePassword: (designerId: string, password: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'achushanu';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { designers, getDesignerById } = useDesigners();
  const [currentUser, setCurrentUser] = useState<Designer | null>(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      return getDesignerById(savedUserId) || null;
    }
    return null;
  });

  const validatePassword = (designerId: string, password: string): boolean => {
    const designer = getDesignerById(designerId);
    if (!designer) return false;
    
    if (designer.isAdmin) {
      return password === ADMIN_PASSWORD;
    }
    
    return designer.password ? password === designer.password : true;
  };

  const login = (designerId: string, password?: string): boolean => {
    const designer = getDesignerById(designerId);
    if (!designer) return false;

    if (designer.password && !validatePassword(designerId, password || '')) {
      return false;
    }

    setCurrentUser(designer);
    localStorage.setItem('currentUserId', designerId);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  const changePassword = (oldPassword: string, newPassword: string): boolean => {
    if (oldPassword === ADMIN_PASSWORD) {
      return true;
    }
    return false;
  };

  const isAdmin = currentUser?.isAdmin || false;

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      isAdmin, 
      changePassword,
      validatePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};