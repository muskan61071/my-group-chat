import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Camera, Mic, Send, X } from 'lucide-react';
import { sendMessage } from '../../services/messageService';
import { uploadMedia } from '../../services/mediaService';
import { AttachmentMenu } from './AttachmentMenu';
import { EmojiPicker } from './EmojiPicker';
import { VoiceRecorder } from './VoiceRecorder';
import { CameraCapture } from './CameraCapture';
import { Modal } from '../common/Modal';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useSettings } from '../../store/settingsStore';
import type { Message, ReplyReference } from '../../../../shared/types';

interface MessageInputProps {
  groupId: string;
  replyTo?: Message | null;
  onClearReply?: () => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

export function MessageInput({
  groupId,
  replyTo,
  onClearReply,
  onTyping,
  onStopTyping,
}: MessageInputProps) {
  const [settings] = useSettings();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Modals form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('25');
  const [paymentNote, setPaymentNote] = useState('Dinner split');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileFilterRef = useRef<string>('*/*');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { isRecording, duration, startRecording, stopRecording, cancelRecording } =
    useVoiceRecorder();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    if (!text.trim() || busy) return;
    const content = text.trim();
    setText('');
    setBusy(true);

    try {
      const replyPayload: ReplyReference | undefined = replyTo
        ? {
            id: replyTo.id,
            senderId: replyTo.senderId,
            senderName: replyTo.senderName,
            text: replyTo.text,
            kind: replyTo.kind,
          }
        : undefined;

      await sendMessage(groupId, {
        kind: 'text',
        text: content,
        replyTo: replyPayload,
      });

      onClearReply?.();
      onStopTyping?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setBusy(false);
    }
  };

  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const attachment = await uploadMedia(groupId, file);
      await sendMessage(groupId, {
        kind: attachment.kind,
        attachment,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSendVoiceNote = async () => {
    const blob = await stopRecording();
    if (!blob) return;

    setBusy(true);
    try {
      const audioFile = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
      const attachment = await uploadMedia(groupId, audioFile);
      attachment.duration = duration;

      await sendMessage(groupId, {
        kind: 'audio',
        attachment,
      });
    } catch (e) {
      alert('Failed to send voice note');
    } finally {
      setBusy(false);
    }
  };

  const handleSendLocation = async () => {
    setShowLocationModal(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await sendMessage(groupId, {
            kind: 'location',
            location: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              label: 'Current Location',
            },
          });
        },
        async () => {
          // Fallback coordinates
          await sendMessage(groupId, {
            kind: 'location',
            location: {
              latitude: 37.7749,
              longitude: -122.4194,
              label: 'San Francisco, CA',
            },
          });
        }
      );
    }
  };

  const handleSendContact = async () => {
    if (!contactName.trim()) return;
    setShowContactModal(false);
    await sendMessage(groupId, {
      kind: 'contact',
      contact: {
        name: contactName,
        phoneNumber: contactPhone,
      },
    });
    setContactName('');
    setContactPhone('');
  };

  const handleSendPayment = async () => {
    const num = Number(paymentAmount);
    if (isNaN(num) || num <= 0) return;
    setShowPaymentModal(false);
    await sendMessage(groupId, {
      kind: 'payment',
      payment: {
        id: 'pay_' + Date.now(),
        amount: num,
        currency: 'USD',
        status: 'completed',
        note: paymentNote,
        createdAt: Date.now(),
      },
    });
  };

  const cursorPosRef = useRef<number | null>(null);

  const updateCursorPos = () => {
    if (textareaRef.current) {
      cursorPosRef.current = textareaRef.current.selectionEnd ?? null;
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setText((prev) => {
      const pos = typeof cursorPosRef.current === 'number' ? cursorPosRef.current : prev.length;
      const safePos = Math.min(Math.max(0, pos), prev.length);
      const nextText = prev.slice(0, safePos) + emoji + prev.slice(safePos);
      const newPos = safePos + emoji.length;
      cursorPosRef.current = newPos;

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      });
      return nextText;
    });
    onTyping?.();
  };

  const handleBackspace = () => {
    setText((prev) => {
      const pos = typeof cursorPosRef.current === 'number' ? cursorPosRef.current : prev.length;
      const safePos = Math.min(Math.max(0, pos), prev.length);
      if (safePos <= 0) return prev;

      const beforeChars = Array.from(prev.slice(0, safePos));
      beforeChars.pop();
      const beforeStr = beforeChars.join('');
      const nextText = beforeStr + prev.slice(safePos);
      const newPos = beforeStr.length;
      cursorPosRef.current = newPos;

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      });
      return nextText;
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* WhatsApp-style Emoji Picker Popover */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleSelectEmoji}
        onBackspace={handleBackspace}
      />

      {/* Quoted Reply Preview Banner */}
      {replyTo && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderTop: '1px solid var(--color-border)',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: '4px solid var(--color-brand-primary)',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-brand-primary)' }}>
              Replying to {replyTo.senderName}
            </span>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {replyTo.text || 'Attachment'}
            </p>
          </div>
          <button className="btn-icon" onClick={onClearReply} style={{ width: '28px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main WhatsApp-style Dock */}
      <div className="message-dock">
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={fileFilterRef.current}
          onChange={(e) => handleFileUpload(e.target.files?.[0])}
        />

        {isRecording ? (
          <VoiceRecorder
            duration={duration}
            onCancel={cancelRecording}
            onSend={handleSendVoiceNote}
          />
        ) : (
          <>
            {/* Left side icons: Emoji, Attachment, Camera */}
            <div className="dock-left-actions">
              <button
                type="button"
                className={`btn-icon ${showEmojiPicker ? 'active-icon' : ''}`}
                title="Emoji"
                onClick={() => {
                  setShowEmojiPicker((prev) => !prev);
                  setShowAttachmentMenu(false);
                }}
                style={{
                  color: showEmojiPicker ? 'var(--color-brand-primary, #8B5E3C)' : undefined,
                  backgroundColor: showEmojiPicker ? 'rgba(139, 94, 60, 0.12)' : undefined,
                  borderRadius: '50%',
                }}
              >
                <Smile size={22} />
              </button>
              <button
                className="btn-icon"
                title="Attach file"
                onClick={() => setShowAttachmentMenu((prev) => !prev)}
              >
                <Paperclip size={22} />
              </button>
              <button
                className="btn-icon"
                title="Camera"
                onClick={() => setShowCameraModal(true)}
              >
                <Camera size={22} />
              </button>
            </div>

            {/* Center: Large auto-expanding text input */}
            <div className="dock-input-area">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Write a message..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  updateCursorPos();
                  onTyping?.();
                }}
                onClick={updateCursorPos}
                onKeyUp={updateCursorPos}
                onSelect={updateCursorPos}
                onFocus={updateCursorPos}
                onBlur={updateCursorPos}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    if (settings.enterToSend) {
                      e.preventDefault();
                      handleSend();
                    }
                  }
                }}
              />
            </div>

            {/* Right side: Microphone button (when empty) OR Send button (when text entered) */}
            <div className="dock-right-action">
              {text.trim() ? (
                <button
                  className="send-circle-btn animate-fade-in"
                  disabled={busy}
                  onClick={handleSend}
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              ) : (
                <button
                  className="mic-circle-btn"
                  onClick={startRecording}
                  title="Record voice note"
                >
                  <Mic size={20} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Attachment Popover */}
      <AttachmentMenu
        isOpen={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        onSelectDocument={() => {
          fileFilterRef.current = '.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt';
          fileInputRef.current?.click();
        }}
        onSelectPhotos={() => {
          fileFilterRef.current = 'image/*,video/*';
          fileInputRef.current?.click();
        }}
        onSelectCamera={() => setShowCameraModal(true)}
        onSelectLocation={() => setShowLocationModal(true)}
        onSelectContact={() => setShowContactModal(true)}
        onSelectPayment={() => setShowPaymentModal(true)}
      />

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleFileUpload}
      />

      {/* Location Share Modal */}
      <Modal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} title="Share Location">
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Share your current GPS location with the group.
        </p>
        <button className="btn-primary" style={{ width: '100%' }} onClick={handleSendLocation}>
          Send Current Location
        </button>
      </Modal>

      {/* Contact Share Modal */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Share Contact">
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Contact Name
            <input
              style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Full Name"
            />
          </label>
          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Phone Number
            <input
              style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </label>
          <button className="btn-primary" onClick={handleSendContact}>
            Share Contact
          </button>
        </div>
      </Modal>

      {/* Payment Attachment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Send Group Payment">
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Amount (USD)
            <input
              type="number"
              style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </label>
          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Note / Purpose
            <input
              style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="e.g., Pizza split"
            />
          </label>
          <button className="btn-primary" onClick={handleSendPayment}>
            Attach Payment Request
          </button>
        </div>
      </Modal>
    </div>
  );
}
