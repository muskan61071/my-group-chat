import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import type { CallSession } from '../../../../shared/types';

interface IncomingCallProps {
  session: CallSession;
  onAccept: (session: CallSession) => void;
  onDecline: (session: CallSession) => void;
}

export function IncomingCall({ session, onAccept, onDecline }: IncomingCallProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '2px solid var(--color-brand-primary)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 999,
        maxWidth: '380px',
      }}
      className="animate-slide-up"
    >
      <div className="pulse-ring" style={{ borderRadius: '50%' }}>
        <Avatar src={session.initiatorPhotoURL} name={session.initiatorName} size={50} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontSize: '0.98rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session.initiatorName}
        </b>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
          Incoming {session.type === 'video' ? 'Video' : 'Voice'} Call · {session.groupName || 'Group'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn-icon"
          style={{ backgroundColor: '#22C55E', color: 'white' }}
          onClick={() => onAccept(session)}
          title="Accept Call"
        >
          {session.type === 'video' ? <Video size={18} /> : <Phone size={18} />}
        </button>
        <button
          className="btn-icon"
          style={{ backgroundColor: '#EF4444', color: 'white' }}
          onClick={() => onDecline(session)}
          title="Decline Call"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}
