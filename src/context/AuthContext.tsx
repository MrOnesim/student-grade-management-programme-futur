import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { users } from '../data/mockData';
import { verifyPassword } from '../utils/crypto';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasAccess: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('futurNotesUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('futurNotesUser'); }
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const found = users.find(u => u.email === email && verifyPassword(password, u.password));
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser as User);
      localStorage.setItem('futurNotesUser', JSON.stringify(safeUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('futurNotesUser');
  }, []);

  const hasAccess = useCallback((roles: UserRole[]): boolean => {
    return user !== null && roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
