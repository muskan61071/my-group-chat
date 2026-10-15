import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield, Lock, Globe } from 'lucide-react';
import { createGroup } from '../../services/groupService';

export function CreateGroupForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');

    try {
      const result = await createGroup({
        name: name.trim(),
        description: description.trim(),
        imageURL: imageURL.trim() || undefined,
        visibility,
      });

      // Navigate directly into the newly created canonical group chat room with invite modal ready
      navigate(`/chat/${result.group.id}`, {
        state: { showInvite: true, inviteCode: result.inviteCode },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-secondary)' }}>
      <header className="main-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-icon" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
            Create New Group
          </h1>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem max(1rem, calc((100% - 540px) / 2))' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            display: 'grid',
            gap: '1.25rem',
          }}
        >
          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
              }}
            >
              <Users size={36} />
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              You will automatically become the Group Admin.
            </p>
          </div>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Group Name *
            <input
              required
              minLength={2}
              maxLength={80}
              placeholder="e.g., Engineering Team, Book Club"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Group Description
            <textarea
              rows={3}
              maxLength={500}
              placeholder="What is this group about?"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Group Picture URL (Optional)
            <input
              type="url"
              placeholder="https://..."
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
          </label>

          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Privacy Setting
            <select
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'white' }}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
            >
              <option value="private">🔒 Private — Invitation Code Only</option>
              <option value="public">🌐 Public — Shareable Invitation</option>
            </select>
          </label>

          <button className="btn-primary" disabled={busy || !name.trim()} style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
            {busy ? 'Creating...' : 'Create Group & Generate Code'}
          </button>
        </form>
      </main>
    </div>
  );
}