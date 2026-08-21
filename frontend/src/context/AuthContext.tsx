import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserType = 'organizer' | 'worker';

export interface User {
  email: string;
  userType: UserType;
  token?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, userType: UserType, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('crew_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (email: string, userType: UserType, token: string) => {
    const u = { email, userType, token };
    setUser(u);
    localStorage.setItem('crew_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crew_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
