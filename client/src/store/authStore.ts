import { useState, useEffect } from 'react';
import type { User } from '../../../shared/types/index.js';
import { getLocalUser, setLocalUser, logout as authLogout } from '../services/authService';

const AUTH_CHANGE_EVENT = 'chat_auth_change';

export function useAuthStore() {
  const [user, setUser] = useState<any>(getLocalUser());

  useEffect(() => {
    const handler = () => {
      setUser(getLocalUser());
    };
    window.addEventListener(AUTH_CHANGE_EVENT, handler);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
  }, []);

  const login = (newUser: any) => {
    setLocalUser(newUser);
  };

  const logout = async () => {
    await authLogout();
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
}

export const authStore = {
  getUser: getLocalUser,
  setUser: setLocalUser,
  logout: authLogout,
};
