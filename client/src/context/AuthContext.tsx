import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface UserMission {
  mission: string;
  status: string;
  last_edit: string;
  gotted: string;
  comments: string;
}

export interface WalletEntry {
  mission: string;
  status: string;
  timestamp: string;
  gotted: string;
  comments: string;
}

export interface User {
  name: string;
  missions: (UserMission | null)[];
  slot_cooldowns: (string | null)[];
  wallet: WalletEntry[];
  completed_count: number;
  success_cooldown_count: number;
  fail_cooldown_count: number;
  selection_complete: boolean;
  selection_pool: number[];
  score: number;
  gotted_history: string[];
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('gotcha_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('gotcha_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('gotcha_user');
    }
  }, [user]);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
