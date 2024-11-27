// src/contexts/ProfileContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { firestore } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from './AuthContext';

type Profile = {
  uid: string;
  email: string;
  name: string;
  description: string;
  photoURL: string;
};

type ProfileContextType = {
  profile: Profile | null;
};

export const ProfileContext = createContext<ProfileContextType>({
  profile: null,
});

interface ProfileProviderProps {
    children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(firestore, 'users', user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as Profile);
        }
      });
      return () => unsub();
    } else {
      setProfile(null);
    }
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile }}>
      {children}
    </ProfileContext.Provider>
  );
};
