import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles, User, Mail, Lock, Zap } from 'lucide-react';
import { googleLogin, login, quickLogin } from '../../services/authService';
import { useSettings } from '../../store/settingsStore';

export function LoginForm() {
  const [settings] = useSettings();
  const [quickName, setQuickName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const getTargetUrl = () => {
    const fromState = location.state?.from;
    if (fromState) {
      if (typeof fromState === 'string') return fromState;
      return (fromState.pathname || '/') + (fromState.search || '');
    }
    const pending = sessionStorage.getItem('chat_pending_invite') || sessionStorage.getItem('hivetalk_pending_invite');
    if (pending) {
      sessionStorage.removeItem('chat_pending_invite');
      sessionStorage.removeItem('hivetalk_pending_invite');
      return `/join?code=${encodeURIComponent(pending)}`;
    }
    return '/';
  };

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) {
      setError('Please enter your name to join');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await quickLogin(quickName.trim());
      navigate(getTargetUrl(), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate(getTargetUrl(), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await googleLogin();
      navigate(getTargetUrl(), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: 'var(--color-bg-secondary)', padding: '1.25rem' }}>
      <div className="auth-card animate-slide-up" style={{ width: '100%', maxWidth: '440px', padding: '2rem', background: 'var(--color-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Top Header: App Logo, Name & Personalize Action */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open_app_branding_modal'))}
              title="Personalize app name & icon"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-brand-primary)',
                background: 'var(--color-brand-subtle)',
                padding: '4px 10px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={13} />
              <span>Personalize App</span>
            </button>
          </div>

          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <img
              src={settings.customAppIcon || '/app-icon.svg'}
              alt={settings.customAppName || 'App Icon'}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '2px solid rgba(255,255,255,0.8)',
              }}
            />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {settings.customAppName || 'Group Chat'}
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: '0.5rem', marginBottom: 0 }}>
            Real-time group conversations with voice, video & media
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* 1-Step Fast Name Join */}
        <form onSubmit={handleQuickJoin} style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'grid', gap: '6px', fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
            <span>Enter Your Name to Join</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="e.g. Alex, Sarah, David..."
                style={{
                  width: '100%',
                  padding: '0.8rem 0.8rem 0.8rem 2.4rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '0.85rem',
              marginTop: '0.75rem',
              background: 'var(--color-brand-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <Zap size={18} />
            <span>{busy ? 'Entering...' : 'Enter Chat with My Name'}</span>
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>OR SIGN IN WITH EMAIL</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
          <label style={{ display: 'grid', gap: '5px', fontWeight: 600, fontSize: '0.85rem' }}>
            <span>Email</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.7rem 0.7rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </label>

          <label style={{ display: 'grid', gap: '5px', fontWeight: 600, fontSize: '0.85rem' }}>
            <span>Password</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.7rem 0.7rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={busy}
            style={{ justifyContent: 'center', width: '100%', padding: '0.75rem', marginTop: '4px' }}
          >
            <span>{busy ? 'Signing In...' : 'Sign In with Email'}</span>
            <ArrowRight size={17} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.9rem 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>OR</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-border)' }} />
        </div>

        <button
          type="button"
          className="btn-secondary"
          style={{ justifyContent: 'center', width: '100%', padding: '0.7rem' }}
          onClick={handleGoogle}
        >
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '1.25rem' }}>
          Need a permanent account?{' '}
          <Link to="/register" style={{ color: 'var(--color-brand-primary)', fontWeight: 700 }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
