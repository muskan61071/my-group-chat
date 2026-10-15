import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  const [showFullPicker, setShowFullPicker] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        className="animate-fade-in"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'white',
          padding: '4px 8px',
          borderRadius: '9999px',
          boxShadow: '0 4px 16px rgba(45, 31, 23, 0.15)',
          border: '1px solid var(--color-border)',
          zIndex: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {COMMON_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            style={{
              fontSize: '1.25rem',
              padding: '2px 4px',
              borderRadius: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.35)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
            onClick={() => {
              onSelect(emoji);
              onClose?.();
            }}
          >
            {emoji}
          </button>
        ))}

        <div style={{ width: '1px', height: '18px', backgroundColor: '#E5E7EB', margin: '0 2px' }} />

        <button
          type="button"
          title="More reactions"
          onMouseDown={(e) => e.preventDefault()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#F3F4F6',
            color: '#6B7280',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#EFEBE9';
            (e.currentTarget as HTMLElement).style.color = '#8B5E3C';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = '#F3F4F6';
            (e.currentTarget as HTMLElement).style.color = '#6B7280';
          }}
          onClick={() => setShowFullPicker((prev) => !prev)}
        >
          <Plus size={16} />
        </button>
      </div>

      <EmojiPicker
        isOpen={showFullPicker}
        title="React to Message"
        isReactionMode={true}
        onClose={() => {
          setShowFullPicker(false);
          onClose?.();
        }}
        onSelect={(emoji) => {
          onSelect(emoji);
          setShowFullPicker(false);
          onClose?.();
        }}
      />
    </div>
  );
}
