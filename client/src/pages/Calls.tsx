import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { getCallHistory } from '../services/callService';
import { Avatar } from '../components/common/Avatar';
import type { CallSession } from '../../../shared/types';

export function Calls() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallSession[]>([]);

  useEffect(() => {
    getCallHistory().then(setCalls).catch(() => setCalls([]));
  }, []);

  const formatDuration = (s?: number) => {
    if (!s) return 'Missed';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
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
              Call History
            </h1>
            <small style={{ color: 'var(--color-text-muted)' }}>Recent voice and video group calls</small>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem max(1rem, calc((100% - 680px) / 2))' }}>
        {calls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
            <Phone size={36} style={{ color: 'var(--color-brand-primary)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
              No call history yet.
            </p>
            <p style={{ fontSize: '0.85rem' }}>Start a group call by tapping "Voice/Video Call" in any group chat.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {calls.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <Avatar src={c.initiatorPhotoURL} name={c.initiatorName} size={44} />
                  <div>
                    <b style={{ fontSize: '0.98rem' }}>{c.groupName || c.initiatorName}</b>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                      {c.status === 'missed' ? (
                        <PhoneMissed size={14} style={{ color: 'var(--color-danger)' }} />
                      ) : (
                        <PhoneIncoming size={14} style={{ color: 'var(--color-brand-primary)' }} />
                      )}
                      <span>{c.type === 'video' ? 'Video Call' : 'Voice Call'}</span>
                      <span>·</span>
                      <span>{new Date(c.startedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span>{formatDuration(c.duration)}</span>
                    </div>
                  </div>
                </div>

                {c.groupId && c.groupId !== 'direct' && (
                  <button
                    className="btn-icon"
                    onClick={() => navigate(`/chat/${c.groupId}`)}
                    title="Open Group Chat"
                  >
                    {c.type === 'video' ? <Video size={18} /> : <Phone size={18} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
