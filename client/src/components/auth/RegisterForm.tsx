import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { register } from '../../services/authService';
import { useSettings } from '../../store/settingsStore';

export function RegisterForm() {
  const [settings] = useSettings();
  const [name, setName] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) return;
    setBusy(true);
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
      navigate(getTargetUrl(), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', backgroundColor: 'var(--color-bg-secondary)', padding: '1rem' }}>
      <form onSubmit={handleSubmit} className="auth-card animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open_app_branding_modal'))}
              title="Personalize app name & icon"
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-brand-primary)',
                background: 'var(--color-brand-subtle)',
                padding: '3px 8px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={12} />
              <span>Personalize App</span>
            </button>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', margin: '0 auto', justifyContent: 'center' }}>
            <img
              src={settings.customAppIcon || '/app-icon.svg'}
              alt={settings.customAppName || 'Chat'}
              style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
              {settings.customAppName || 'Group Chat'}
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginTop: '0.65rem' }}>
            Join {settings.customAppName || 'Group Chat'} and start collaborating in real-time.
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <label style={{ display: 'grid', gap: '4px', fontWeight: 600, fontSize: '0.88rem' }}>
            Your Name
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600, fontSize: '0.88rem' }}>
            Email Address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600, fontSize: '0.88rem' }}>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            />
          </label>
        </div>

        <button className="btn-primary" disabled={busy} style={{ justifyContent: 'center', width: '100%' }}>
          <span>{busy ? 'Creating Account...' : 'Get Started'}</span>
          <ArrowRight size={18} />
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-brand-primary)', fontWeight: 700 }}>
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
