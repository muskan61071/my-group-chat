import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  FileText,
  MapPin,
  User as UserIcon,
  CreditCard,
  MoreHorizontal,
  Reply,
  Copy,
  Pin,
  Star,
  Edit2,
  Trash2,
  Smile,
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import type { Message } from '../../../../shared/types';
import { getApiBase } from '../../api/apiClient';
import { Avatar } from '../common/Avatar';
import { VoiceMessage } from './VoiceMessage';
import { ReactionPicker } from './ReactionPicker';

const isOnlyEmojis = (str?: string | null): { isOnly: boolean; count: number } => {
  if (!str) return { isOnly: false, count: 0 };
  const trimmed = str.trim();
  if (!trimmed) return { isOnly: false, count: 0 };
  try {
    const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu;
    const matches = trimmed.match(emojiRegex);
    if (!matches) return { isOnly: false, count: 0 };
    const stripped = trimmed.replace(emojiRegex, '').replace(/[\s\uFE0E\uFE0F]/g, '');
    if (stripped.length === 0 && matches.length <= 3) {
      return { isOnly: true, count: matches.length };
    }
  } catch {}
  return { isOnly: false, count: 0 };
};

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (message: Message) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onPin: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isMine,
  onReply,
  onReact,
  onEdit,
  onDeleteForEveryone,
  onDeleteForMe,
  onPin,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  // Robust detection so photos NEVER render as folders/document cards
  const isImageAttachment = (msg: Message) => {
    if (msg.kind === 'image') return true;
    const att = msg.attachment;
    if (!att) return false;
    if (att.kind === 'image') return true;
    if (att.mimeType?.startsWith('image/')) return true;
    const nameOrUrl = (att.name || att.url || '').toLowerCase();
    return /\.(jpe?g|png|gif|webp|svg|bmp|avif|jfif|ico)($|\?)/i.test(nameOrUrl);
  };

  const isVideoAttachment = (msg: Message) => {
    if (msg.kind === 'video') return true;
    const att = msg.attachment;
    if (!att) return false;
    if (att.kind === 'video') return true;
    if (att.mimeType?.startsWith('video/')) return true;
    const nameOrUrl = (att.name || att.url || '').toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v|mkv)($|\?)/i.test(nameOrUrl);
  };

  const isAudioAttachment = (msg: Message) => {
    if (msg.kind === 'audio') return true;
    const att = msg.attachment;
    if (!att) return false;
    if (att.kind === 'audio') return true;
    if (att.mimeType?.startsWith('audio/')) return true;
    const nameOrUrl = (att.name || att.url || '').toLowerCase();
    return /\.(mp3|wav|ogg|m4a|aac|webm|flac)($|\?)/i.test(nameOrUrl);
  };

  const resolveMediaUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const apiBase = getApiBase();
    const serverOrigin = apiBase.replace(/\/api\/?$/, '');
    return `${serverOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyText = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
    }
    setShowMenu(false);
  };

  // If message soft-deleted for everyone
  if (message.deletedAt) {
    return (
      <div className={`message-bubble-row ${isMine ? 'mine' : ''}`}>
        <div className={`message-bubble ${isMine ? 'mine' : 'incoming'}`}>
          <i style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            🚫 This message was deleted
          </i>
          <div className="message-meta">
            <span>{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: isMine ? '#0369A1' : 'var(--color-brand-primary)',
              textDecoration: 'underline',
              wordBreak: 'break-all',
              fontWeight: 600,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`message-bubble-row ${isMine ? 'mine' : ''}`}
      onMouseLeave={() => {
        setShowMenu(false);
        setShowReactions(false);
      }}
    >
      {!isMine && (
        <Avatar src={message.senderPhotoURL} name={message.senderName} size={32} />
      )}

      <div className={`message-bubble ${isMine ? 'mine' : 'incoming'}`}>
        {/* Sender Name if incoming */}
        {!isMine && (
          <div className="message-sender-name">
            <span>{message.senderName}</span>
          </div>
        )}

        {/* Quoted Replied Message */}
        {message.replyTo && (
          <div className="message-reply-preview">
            <b>{message.replyTo.senderName}</b>
            <p style={{ margin: '2px 0 0', opacity: 0.85, fontSize: '0.75rem' }}>
              {message.replyTo.text || 'Attachment'}
            </p>
          </div>
        )}

        {/* 1. TEXT OR WHATSAPP BIG EMOJIS */}
        {message.text && (() => {
          const emojiCheck = isOnlyEmojis(message.text);
          if (emojiCheck.isOnly && !message.attachment && message.kind === 'text') {
            return (
              <div
                style={{
                  fontSize: emojiCheck.count === 1 ? '3.4rem' : emojiCheck.count === 2 ? '2.5rem' : '1.95rem',
                  lineHeight: 1.15,
                  margin: '0.15rem 0',
                  userSelect: 'none',
                }}
                title={message.text}
              >
                {message.text}
              </div>
            );
          }
          return (
            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
              {renderFormattedText(message.text)}
            </p>
          );
        })()}

        {/* 2. IMAGE (Always rendered as photo thumbnail, NEVER as document/folder card) */}
        {isImageAttachment(message) && message.attachment && (
          <div
            style={{
              position: 'relative',
              marginTop: '0.35rem',
              overflow: 'hidden',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <img
              src={resolveMediaUrl(message.attachment.url)}
              alt={message.attachment.name || 'Photo'}
              className="media-attachment-image"
              style={{
                display: 'block',
                maxHeight: '340px',
                width: '100%',
                objectFit: 'cover',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onClick={() => setShowLightbox(true)}
            />
            {/* View full-size overlay badge */}
            <div
              onClick={() => setShowLightbox(true)}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.65)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Maximize2 size={12} /> View
            </div>
          </div>
        )}

        {/* 3. VIDEO */}
        {!isImageAttachment(message) && isVideoAttachment(message) && message.attachment && (
          <video
            src={resolveMediaUrl(message.attachment.url)}
            controls
            style={{ borderRadius: 'var(--radius-md)', maxHeight: '280px', width: '100%', marginTop: '0.35rem' }}
          />
        )}

        {/* 4. VOICE NOTE / AUDIO */}
        {!isImageAttachment(message) && !isVideoAttachment(message) && isAudioAttachment(message) && message.attachment && (
          <VoiceMessage
            url={resolveMediaUrl(message.attachment.url)}
            duration={message.attachment.duration || 12}
          />
        )}

        {/* 5. DOCUMENT (NON-MEDIA ONLY: PDF, DOC, ZIP) */}
        {!isImageAttachment(message) && !isVideoAttachment(message) && !isAudioAttachment(message) && message.attachment && (
          <div className="document-attachment-card">
            <div className="document-icon-box">
              <FileText size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {message.attachment.name}
              </p>
              <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                {message.attachment.size ? `${Math.round(message.attachment.size / 1024)} KB` : 'Document'}
              </small>
            </div>
            <a
              href={resolveMediaUrl(message.attachment.url)}
              download={message.attachment.name}
              target="_blank"
              rel="noreferrer"
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
              title="Download file"
            >
              <Download size={16} />
            </a>
          </div>
        )}

        {/* 6. LOCATION */}
        {message.kind === 'location' && message.location && (
          <div
            style={{
              padding: '0.65rem',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginTop: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
              <MapPin size={18} />
              <b>{message.location.label || 'Shared Location'}</b>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {message.location.address || `${message.location.latitude.toFixed(4)}, ${message.location.longitude.toFixed(4)}`}
            </p>
            <a
              href={`https://www.google.com/maps?q=${message.location.latitude},${message.location.longitude}`}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-block', marginTop: '0.4rem', color: 'var(--color-brand-primary)', fontWeight: 600, fontSize: '0.75rem' }}
            >
              Open in Google Maps →
            </a>
          </div>
        )}

        {/* 7. CONTACT */}
        {message.kind === 'contact' && message.contact && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginTop: '0.35rem',
            }}
          >
            <div className="document-icon-box">
              <UserIcon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <b>{message.contact.name}</b>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {message.contact.phoneNumber || message.contact.email}
              </p>
            </div>
          </div>
        )}

        {/* 8. PAYMENT */}
        {message.kind === 'payment' && message.payment && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginTop: '0.35rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                <CreditCard size={18} /> Payment
              </span>
              <span className="badge badge-brand">{message.payment.status.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.3rem 0', color: 'var(--color-brand-dark)' }}>
              ${message.payment.amount} {message.payment.currency}
            </p>
            {message.payment.note && (
              <small style={{ color: 'var(--color-text-muted)' }}>{message.payment.note}</small>
            )}
          </div>
        )}

        {/* Reactions List */}
        {(() => {
          const validReactions = Object.entries(message.reactions || {}).filter(
            ([_, uids]) => Array.isArray(uids) && uids.length > 0
          );
          if (validReactions.length === 0) return null;
          return (
            <div className="reactions-row">
              {validReactions.map(([emoji, uids]) => (
                <button
                  key={emoji}
                  type="button"
                  className="reaction-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReact(message.id, emoji);
                  }}
                  title={`Reacted by ${uids.length} member${uids.length > 1 ? 's' : ''}`}
                >
                  <span>{emoji}</span>
                  <span>{uids.length}</span>
                </button>
              ))}
            </div>
          );
        })()}

        {/* Footer Meta: Timestamp, Edited tag, Pinned tag, Status checkmarks */}
        <div className="message-meta">
          {message.isPinned && <Pin size={12} style={{ color: 'var(--color-brand-primary)' }} />}
          {message.editedAt && <span className="message-edited-tag">Edited</span>}
          <span>{formatTime(message.createdAt)}</span>
          {isMine && (
            <span className="message-checkmarks">
              <CheckCheck size={14} />
            </span>
          )}
        </div>

        {/* Quick Reaction & Menu Buttons Trigger on Hover (WhatsApp-Style) */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: isMine ? 'auto' : '-64px',
            left: isMine ? '-64px' : 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            zIndex: 15,
          }}
        >
          <button
            type="button"
            className="btn-icon"
            style={{
              width: '26px',
              height: '26px',
              background: 'white',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)',
              opacity: showReactions ? 1 : 0.85,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions((prev) => !prev);
              setShowMenu(false);
            }}
            title="React to message"
          >
            <Smile size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            style={{
              width: '26px',
              height: '26px',
              background: 'white',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)',
              opacity: showMenu ? 1 : 0.85,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
              setShowReactions(false);
            }}
            title="Message options"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Context Menu Dropdown */}
        {showMenu && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              top: '32px',
              right: isMine ? '0' : 'auto',
              left: isMine ? 'auto' : '0',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.4rem',
              zIndex: 30,
              minWidth: '170px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <button
              className="btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '0.5rem', width: '100%', fontSize: '0.85rem' }}
              onClick={() => {
                setShowReactions(true);
                setShowMenu(false);
              }}
            >
              <Smile size={15} /> React
            </button>
            <button
              className="btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '0.5rem', width: '100%', fontSize: '0.85rem' }}
              onClick={() => {
                onReply(message);
                setShowMenu(false);
              }}
            >
              <Reply size={15} /> Reply
            </button>
            {message.text && (
              <button
                className="btn-ghost"
                style={{ justifyContent: 'flex-start', gap: '0.5rem', width: '100%', fontSize: '0.85rem' }}
                onClick={copyText}
              >
                <Copy size={15} /> Copy
              </button>
            )}
            <button
              className="btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '0.5rem', width: '100%', fontSize: '0.85rem' }}
              onClick={() => {
                onPin(message.id);
                setShowMenu(false);
              }}
            >
              <Pin size={15} /> {message.isPinned ? 'Unpin' : 'Pin'}
            </button>
            {isMine && message.text && (
              <button
                className="btn-ghost"
                style={{ justifyContent: 'flex-start', gap: '0.5rem', width: '100%', fontSize: '0.85rem' }}
                onClick={() => {
                  onEdit(message);
                  setShowMenu(false);
                }}
              >
                <Edit2 size={15} /> Edit
              </button>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '4px 0' }} />
            <button
              className="btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '0.5rem', width: '100%', fontSize: '0.85rem', color: 'var(--color-danger)' }}
              onClick={() => {
                onDeleteForEveryone(message.id);
                setShowMenu(false);
              }}
            >
              <Trash2 size={15} /> Delete for everyone
            </button>
          </div>
        )}

        {/* Reaction Picker Bar */}
        {showReactions && (
          <div style={{ position: 'absolute', top: '-44px', left: isMine ? 'auto' : 0, right: isMine ? 0 : 'auto', zIndex: 35 }}>
            <ReactionPicker
              onSelect={(emoji) => {
                onReact(message.id, emoji);
                setShowReactions(false);
              }}
              onClose={() => setShowReactions(false)}
            />
          </div>
        )}

        {/* Full-Screen Photo Lightbox Modal */}
        {showLightbox && message.attachment && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(10, 10, 10, 0.94)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.5rem',
            }}
            onClick={() => setShowLightbox(false)}
            className="animate-fade-in"
          >
            {/* Top Toolbar */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'white',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <b style={{ fontSize: '1.05rem', display: 'block' }}>{message.senderName}</b>
                <small style={{ color: '#D1D5DB' }}>
                  {new Date(message.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </small>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <a
                  href={resolveMediaUrl(message.attachment.url)}
                  download={message.attachment.name || 'photo.jpg'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-icon"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)', color: 'white' }}
                  title="Download full photo"
                >
                  <Download size={20} />
                </a>
                <button
                  type="button"
                  className="btn-icon"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)', color: 'white' }}
                  onClick={() => setShowLightbox(false)}
                  title="Close viewer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* High-Resolution Centered Image */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '92vw',
                maxHeight: '80vh',
                margin: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={resolveMediaUrl(message.attachment.url)}
                alt={message.attachment.name || 'Full photo'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '78vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                }}
              />
            </div>

            {/* Optional message text below photo */}
            {message.text && (
              <div
                style={{
                  margin: '0 auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '24px',
                  color: 'white',
                  maxWidth: '640px',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.92rem',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
