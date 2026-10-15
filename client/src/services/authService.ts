import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import { socketService } from './socketService';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}

const AUTH_STORAGE_KEY = 'chat_app_user';

export function getLocalUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem('hivetalk_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    socketService.connect(user);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('hivetalk_user');
  }
  window.dispatchEvent(new Event('chat_auth_change'));
  window.dispatchEvent(new Event('hivetalk_auth_change')); // backwards compatibility
}

export async function login(email: string, password: string, displayName?: string): Promise<AuthUser> {
  if (isFirebaseConfigured && auth) {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const u: AuthUser = {
      uid: res.user.uid,
      email: res.user.email || email,
      displayName: res.user.displayName || displayName || email.split('@')[0],
      photoURL: res.user.photoURL,
    };
    setLocalUser(u);
    return u;
  }

  // Local simulated authentication
  const uid = 'usr_' + btoa(email.toLowerCase()).replace(/=/g, '').slice(0, 12);
  const resolvedName = displayName?.trim() || email.split('@')[0].replace('.', ' ');
  const u: AuthUser = {
    uid,
    email,
    displayName: resolvedName,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=8B5E3C,6F472B`,
  };
  setLocalUser(u);
  return u;
}

export async function quickLogin(name: string): Promise<AuthUser> {
  const cleanName = name.trim() || 'Member';
  const cleanEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member'}@chat.local`;
  return login(cleanEmail, 'password123', cleanName);
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  if (isFirebaseConfigured && auth) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    const u: AuthUser = {
      uid: res.user.uid,
      email: res.user.email || email,
      displayName: name,
      photoURL: res.user.photoURL,
    };
    setLocalUser(u);
    return u;
  }

  const uid = 'usr_' + Date.now().toString(36);
  const u: AuthUser = {
    uid,
    email,
    displayName: name,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=8B5E3C,6F472B`,
  };
  setLocalUser(u);
  return u;
}

export async function googleLogin(): Promise<AuthUser> {
  if (isFirebaseConfigured && auth) {
    const res = await signInWithPopup(auth, googleProvider);
    const u: AuthUser = {
      uid: res.user.uid,
      email: res.user.email || 'google@user.com',
      displayName: res.user.displayName || 'Google User',
      photoURL: res.user.photoURL,
    };
    setLocalUser(u);
    return u;
  }

  const uid = 'usr_g_' + Date.now().toString(36);
  const u: AuthUser = {
    uid,
    email: 'alex.rivera@chat.local',
    displayName: 'Alex Rivera',
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=Alex`,
  };
  setLocalUser(u);
  return u;
}

export async function logout(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  setLocalUser(null);
}

export async function updateUserProfile(data: { displayName?: string; photoURL?: string | null }) {
  const current = getLocalUser();
  if (current) {
    const updated = { ...current, ...data };
    setLocalUser(updated);
  }
  if (isFirebaseConfigured && auth?.currentUser) {
    await updateProfile(auth.currentUser, data);
  }
}
