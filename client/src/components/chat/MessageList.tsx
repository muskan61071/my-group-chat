import React, { useEffect, useState, useRef } from 'react';
import { Pin, X } from 'lucide-react';
import {
  listenMessages,
  reactToMessage,
  deleteMessage,
  editMessage,
  pinMessage,
} from '../../services/messageService';
import type { Message } from '../../../../shared/types';
import { useAuth } from '../../hooks/useAuth';
import { MessageBubble } from './MessageBubble';
import { Modal } from '../common/Modal';
import { useSettings } from '../../store/settingsStore';

interface MessageListProps {
  groupId: string;
  typingUsers?: string[];
  onReply: (message: Message) => void;
}

export function MessageList({ groupId, typingUsers = [], onReply }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const user = useAuth();
  const [settings] = useSettings();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const unsub = listenMessages(groupId, (updater) => {
      setMessages((prev) => updater(prev));
    });
    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers.length]);

  const handleReact = async (messageId: string, emoji: string) => {
    await reactToMessage(groupId, messageId, emoji);
  };

  const handleDeleteForEveryone = async (messageId: string) => {
    if (confirm('Delete this message for everyone in the group?')) {
      await deleteMessage(groupId, messageId, true);
    }
  };

  const handleDeleteForMe = async (messageId: string) => {
    await deleteMessage(groupId, messageId, false);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const handlePin = async (messageId: string) => {
    await pinMessage(groupId, messageId);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editText.trim()) return;
    await editMessage(groupId, editingMessage.id, editText.trim());
    setEditingMessage(null);
    setEditText('');
  };

  const pinnedMessage = messages.find((m) => m.isPinned);

  const scrollToMessage = (id: string) => {
    messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Group messages with date separators
  const renderMessageList = () => {
    let lastDate = '';
    return messages.map((m) => {
      const msgDate = new Date(m.createdAt).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const showDate = msgDate !== lastDate;
      lastDate = msgDate;

      return (
        <React.Fragment key={m.id}>
          {showDate && <div className="date-separator">{msgDate}</div>}
          <div ref={(el) => (messageRefs.current[m.id] = el)}>
            <MessageBubble
              message={m}
              isMine={m.senderId === user?.uid}
              onReply={onReply}
              onReact={handleReact}
              onEdit={(msg) => {
                setEditingMessage(msg);
                setEditText(msg.text || '');
              }}
              onDeleteForEveryone={handleDeleteForEveryone}
              onDeleteForMe={handleDeleteForMe}
              onPin={handlePin}
            />
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Sticky Pinned Message Banner */}
      {pinnedMessage && (
        <div className="pinned-banner">
          <div className="pinned-banner-content" onClick={() => scrollToMessage(pinnedMessage.id)}>
            <Pin size={16} style={{ color: 'var(--color-brand-primary)', transform: 'rotate(45deg)' }} />
            <div style={{ minWidth: 0 }}>
              <b style={{ fontSize: '0.78rem', color: 'var(--color-brand-primary)' }}>Pinned Message: </b>
              <span className="pinned-banner-text">{pinnedMessage.text || 'Attachment'}</span>
            </div>
          </div>
          <button
            className="btn-icon"
            style={{ width: '28px', height: '28px' }}
            onClick={() => handlePin(pinnedMessage.id)}
            title="Unpin message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Dynamic WhatsApp Wallpaper Scroll Area */}
      <section
        className="messages-container"
        style={{
          backgroundColor: settings.wallpaperColor || '#FAF7F4',
          backgroundImage:
            settings.wallpaperType === 'custom' && settings.customWallpaperUrl
              ? `url(${settings.customWallpaperUrl})`
              : settings.showDoodle
              ? 'radial-gradient(rgba(0,0,0,0.11) 1.2px, transparent 1.2px)'
              : 'none',
          backgroundSize: settings.wallpaperType === 'custom' ? 'cover' : '24px 24px',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Dimming overlay if user configured dimming slider */}
        {settings.dimmingLevel > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'black',
              opacity: settings.dimmingLevel / 100,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '0.65rem', minHeight: '100%' }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-brand-primary)' }}>
                No messages yet in this group.
              </p>
              <p style={{ fontSize: '0.85rem' }}>Send a greeting or share an invite code to start chatting!</p>
            </div>
          ) : (
            renderMessageList()
          )}

          {/* Real-time Typing Indicator Bubble */}
          {typingUsers.length > 0 && (
            <div className="message-bubble-row">
              <div
                className="message-bubble incoming animate-fade-in"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.5rem 0.85rem',
                  backgroundColor: 'white',
                }}
              >
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                </span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-brand-primary)', animation: 'typingBounce 1.4s infinite ease-in-out' }} />
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-brand-primary)', animation: 'typingBounce 1.4s infinite ease-in-out 0.2s' }} />
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-brand-primary)', animation: 'typingBounce 1.4s infinite ease-in-out 0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </section>

      {/* Edit Message Modal */}
      <Modal isOpen={!!editingMessage} onClose={() => setEditingMessage(null)} title="Edit Message">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <textarea
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontFamily: 'inherit',
            }}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setEditingMessage(null)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSaveEdit}>
              Save changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
