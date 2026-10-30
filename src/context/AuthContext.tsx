import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '../firebase';
import { AuthContextValue, PlayerProfile } from '../types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const defaultShipColor = '#FF9F43';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'players', currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          const createdProfile: PlayerProfile = {
            uid: currentUser.uid,
            email: currentUser.email ?? '',
            username: currentUser.email?.split('@')[0] ?? 'Pilot',
            shipColor: defaultShipColor,
            bestScore: 0,
            bestLevel: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(profileRef, createdProfile, { merge: true });
          setProfile(createdProfile);
          return;
        }

        const data = profileSnap.data() as Partial<PlayerProfile>;
        const normalizedProfile: PlayerProfile = {
          uid: currentUser.uid,
          email: data.email ?? currentUser.email ?? '',
          username: data.username ?? currentUser.email?.split('@')[0] ?? 'Pilot',
          shipColor: data.shipColor ?? defaultShipColor,
          bestScore: data.bestScore ?? 0,
          bestLevel: data.bestLevel ?? 1,
          createdAt: data.createdAt ?? new Date().toISOString(),
          updatedAt: data.updatedAt ?? new Date().toISOString(),
        };

        setProfile(normalizedProfile);
      } catch (error) {
        console.error('Profile load failed', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const nextProfile: PlayerProfile = {
      uid,
      email,
      username,
      shipColor: defaultShipColor,
      bestScore: 0,
      bestLevel: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'players', uid), nextProfile, { merge: true });
    setProfile(nextProfile);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const updateProfile = async (username: string, shipColor: string) => {
    if (!user) {
      return;
    }

    const profileRef = doc(db, 'players', user.uid);
    const nextProfile = {
      ...(profile ?? {}),
      uid: user.uid,
      email: user.email ?? '',
      username,
      shipColor,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(profileRef, {
      username,
      shipColor,
      updatedAt: new Date().toISOString(),
    });

    setProfile(nextProfile as PlayerProfile);
  };

  const updateGameStats = async (score: number, level: number) => {
    if (!user) {
      return;
    }

    const profileRef = doc(db, 'players', user.uid);
    const currentProfile = profile ?? {
      uid: user.uid,
      email: user.email ?? '',
      username: user.email?.split('@')[0] ?? 'Pilot',
      shipColor: defaultShipColor,
      bestScore: 0,
      bestLevel: 1,
    };

    const nextBestScore = Math.max(currentProfile.bestScore ?? 0, score);
    const nextBestLevel = Math.max(currentProfile.bestLevel ?? 1, level);

    await updateDoc(profileRef, {
      bestScore: nextBestScore,
      bestLevel: nextBestLevel,
      updatedAt: new Date().toISOString(),
    });

    setProfile({
      ...currentProfile,
      bestScore: nextBestScore,
      bestLevel: nextBestLevel,
      shipColor: currentProfile.shipColor ?? defaultShipColor,
      updatedAt: new Date().toISOString(),
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      updateGameStats,
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
