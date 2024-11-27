// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { firebaseAuth, firestore, realtimeDB } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, onDisconnect, set, serverTimestamp } from 'firebase/database';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      if (authUser) {
        // Fetch user data from Firestore
        const userDocRef = doc(firestore, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser(authUser);
        } else {
          // If user document doesn't exist, create it
          await setDoc(userDocRef, {
            uid: authUser.uid,
            email: authUser.email,
            name: authUser.displayName || 'Unnamed User',
            photoURL: authUser.photoURL || null,
            phoneNumber: authUser.phoneNumber || null,
          });
          setUser(authUser);
        }

        // Set user status to online in Realtime Database
        const userStatusDatabaseRef = ref(realtimeDB, `/status/${authUser.uid}`);

        // Set online status
        set(userStatusDatabaseRef, {
          state: 'online',
          lastChanged: serverTimestamp(),
        });

        // Ensure status is updated to offline on disconnect
        onDisconnect(userStatusDatabaseRef).set({
          state: 'offline',
          lastChanged: serverTimestamp(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
  );
};
