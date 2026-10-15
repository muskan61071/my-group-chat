import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { getLocalUser, AuthUser } from '../services/authService';
import { socketService } from '../services/socketService';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    // Initial check from local storage
    const local = getLocalUser();
    if (local) {
      setUser(local);
      socketService.connect(local);
    } else if (!isFirebaseConfigured) {
      setUser(null);
    }

    // Listen to custom local auth change events
    const handleAuthChange = () => {
      const u = getLocalUser();
      setUser(u);
    };
    window.addEventListener('chat_auth_change', handleAuthChange);
    window.addEventListener('hivetalk_auth_change', handleAuthChange);

    // Firebase Auth listener if active
    let unsub = () => {};
    if (isFirebaseConfigured && auth) {
      unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const authUser: AuthUser = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Member',
            photoURL: fbUser.photoURL,
          };
          setUser(authUser);
          socketService.connect(authUser);
        } else {
          setUser(getLocalUser());
        }
      });
    }

    return () => {
      window.removeEventListener('chat_auth_change', handleAuthChange);
      window.removeEventListener('hivetalk_auth_change', handleAuthChange);
      unsub();
    };
  }, []);

  return user;
}