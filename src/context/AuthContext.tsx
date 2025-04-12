'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserData, AdminData, getAdminByUserId } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string, role?: string, rememberMe?: boolean) => Promise<UserData | AdminData>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  login: async () => {
    throw new Error('Login function not implemented');
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string, role?: string, rememberMe?: boolean) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (role === 'admin') {
        const adminData = await getAdminByUserId(user.uid);
        if (!adminData) {
          throw new Error('Not authorized as admin');
        }
        return adminData;
      }

      // For non-admin users, return basic user data
      return {
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        role: role || 'newbie',
        applicationStatus: 'pending',
        createdAt: new Date(),
      } as UserData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Here you would typically fetch the user's data from Firestore
        // For now, we'll just set some mock data
        setUserData({
          name: user.displayName || 'User',
          email: user.email || '',
          role: 'newbie',
          applicationStatus: 'pending',
          createdAt: new Date(),
        });
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};