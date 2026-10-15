import React from 'react';

interface ReactionListProps {
  reactions?: Record<string, string[]>;
  onSelectEmoji?: (emoji: string) => void;
  currentUserId?: string;
}

export function ReactionList({ reactions, onSelectEmoji, currentUserId }: ReactionListProps) {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div className="reactions-row">
      {Object.entries(reactions).map(([emoji, uids]) => {
        const isMine = currentUserId ? uids.includes(currentUserId) : false;
        return (
          <button
            key={emoji}
            type="button"
            className={`reaction-pill ${isMine ? 'active-reaction' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectEmoji?.(emoji);
            }}
            title={`${uids.length} reaction${uids.length > 1 ? 's' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '12px',
              border: isMine ? '1px solid var(--color-brand-primary, #008069)' : '1px solid rgba(0,0,0,0.08)',
              backgroundColor: isMine ? 'rgba(0, 128, 105, 0.12)' : 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span>{emoji}</span>
            {uids.length > 1 && <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>{uids.length}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default ReactionList;
