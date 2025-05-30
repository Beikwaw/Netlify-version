'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserData, AdminData, getAdminByUserId } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string, role?: string, rememberMe?: boolean) => Promise<UserData | AdminData>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  login: async () => {
    throw new Error('Login function not implemented');
  },
  logout: async () => {
    throw new Error('Logout function not implemented');
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
        surname: '',
        full_name: user.displayName || 'User',
        role: 'newbie',
        applicationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        place_of_study: '',
        room_number: '',
        tenant_code: '',
        isGuest: false
      } as UserData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
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
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          surname: '',
          full_name: user.displayName || 'User',
          role: 'newbie',
          applicationStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          place_of_study: '',
          room_number: '',
          tenant_code: '',
          isGuest: false
        });
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout }}>
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