import React from 'react';
import { Trash2, Send } from 'lucide-react';

interface VoiceRecorderProps {
  duration: number;
  onCancel: () => void;
  onSend: () => void;
}

export function VoiceRecorder({ duration, onCancel, onSend }: VoiceRecorderProps) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.4rem 1rem',
        backgroundColor: '#FFF0EE',
        borderRadius: '24px',
        border: '1px solid #FFCDD2',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          className="recording-dot"
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-danger)',
          }}
        />
        <span style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '0.95rem' }}>
          {formatTime(duration)}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Recording audio note...
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          className="btn-icon"
          onClick={onCancel}
          style={{ color: 'var(--color-danger)' }}
          title="Cancel recording"
        >
          <Trash2 size={18} />
        </button>
        <button
          className="send-circle-btn"
          onClick={onSend}
          title="Send voice note"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
