import React, { createContext, useContext, useState, ReactNode } from 'react';
import { currentStudent, admins } from '@/data/mockData';

type UserRole = 'student' | 'admin' | null;

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (role === 'student') {
      setUser({
        id: currentStudent.id,
        name: currentStudent.name,
        email: currentStudent.email,
        role: 'student',
      });
      return true;
    } else if (role === 'admin') {
      const admin = admins[0];
      setUser({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
