import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const u = useAuth();
  const location = useLocation();

  if (u === undefined) {
    return <main className="center">Loading…</main>;
  }

  if (!u) {
    // Preserve invite code across login/registration from both query params & path slugs
    const queryCode = new URLSearchParams(location.search).get('code');
    if (queryCode) {
      sessionStorage.setItem('hivetalk_pending_invite', queryCode.trim().toUpperCase());
    } else if (location.pathname.startsWith('/join/')) {
      const parts = location.pathname.split('/join/')[1]?.split('/')[0];
      if (parts) {
        sessionStorage.setItem('hivetalk_pending_invite', parts.trim().toUpperCase());
      }
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
