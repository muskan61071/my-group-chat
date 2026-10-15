import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/authService';
import { Avatar } from '../components/common/Avatar';

export function Profile() {
  const navigate = useNavigate();
  const user = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [statusText, setStatusText] = useState('Available');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      displayName: displayName.trim(),
      photoURL: photoURL.trim() || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-secondary)' }}>
      <header className="main-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-icon" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
              Profile
            </h1>
            <small style={{ color: 'var(--color-text-muted)' }}>Manage your personal details</small>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem max(1rem, calc((100% - 540px) / 2))' }}>
        <form
          onSubmit={handleSave}
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'grid',
            gap: '1.25rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <Avatar src={photoURL} name={displayName || 'User'} size={96} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              {user?.email}
            </p>
          </div>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Display Name
            <input
              required
              minLength={2}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Avatar Image URL
            <input
              type="url"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Status / Bio
            <input
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
            />
          </label>

          <button className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            {saved ? <Check size={18} /> : null}
            <span>{saved ? 'Saved Successfully' : 'Save Changes'}</span>
          </button>
        </form>
      </main>
    </div>
  );
}
