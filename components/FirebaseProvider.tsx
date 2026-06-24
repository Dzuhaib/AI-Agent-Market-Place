'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  displayName?: string;
  photoURL?: string;
  onboarded?: boolean;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  needsOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isSeller: false,
  isAdmin: false,
  needsOnboarding: false,
});

export const useAuth = () => useContext(AuthContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

  const isSeller = profile?.role === 'seller' || profile?.role === 'both' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin' || user?.email === 'myselfzuhaib@gmail.com';
  const needsOnboarding = user !== null && !loading && (profile === null || !profile.onboarded);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isSeller, isAdmin, needsOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}
