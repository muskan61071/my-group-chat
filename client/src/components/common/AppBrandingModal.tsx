import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Laptop,
} from 'lucide-react';
import { Modal } from './Modal';
import {
  useSettings,
  pushBrandingToServer,
  AppTheme,
} from '../../store/settingsStore';

interface AppBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstInstall?: boolean;
}

const PRESET_APP_NAMES = [
  'Group Chat',
  'Family Circle',
  'Friends Lounge',
  'Campus Connect',
  'Workplace Hub',
  'Team Space',
  'Pulse Chat',
  'Gaming Guild',
];

const PRESET_ICONS = [
  { label: 'Chat', emoji: '💬', bg: '#008069' },
  { label: 'Community', emoji: '👥', bg: '#2563EB' },
  { label: 'Rocket', emoji: '🚀', bg: '#4F46E5' },
  { label: 'Lightning', emoji: '⚡', bg: '#D97706' },
  { label: 'Flame', emoji: '🔥', bg: '#DC2626' },
  { label: 'Campus', emoji: '🎓', bg: '#6366F1' },
  { label: 'Home', emoji: '🏡', bg: '#059669' },
  { label: 'Work', emoji: '💼', bg: '#1E293B' },
  { label: 'Diamond', emoji: '💎', bg: '#0284C7' },
  { label: 'Heart', emoji: '❤️', bg: '#E11D48' },
  { label: 'Star', emoji: '⭐', bg: '#CA8A04' },
  { label: 'Gaming', emoji: '🎮', bg: '#7C3AED' },
  { label: 'Music', emoji: '🎵', bg: '#9333EA' },
  { label: 'Hangout', emoji: '🍕', bg: '#EA580C' },
];

function generateSvgIconDataUrl(emoji: string, bgColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="${bgColor}"/><text x="50" y="66" font-size="52" text-anchor="middle" font-family="sans-serif">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function AppBrandingModal({ isOpen, onClose, isFirstInstall = false }: AppBrandingModalProps) {
  const [settings, updateSettings] = useSettings();

  const [nameInput, setNameInput] = useState(settings.customAppName || 'Group Chat');
  const [iconPreview, setIconPreview] = useState<string | null>(settings.customAppIcon || null);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(settings.theme || 'whatsapp-light');
  const [syncWithServer, setSyncWithServer] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNameInput(settings.customAppName || 'Group Chat');
      setIconPreview(settings.customAppIcon || null);
      setSelectedTheme(settings.theme || 'whatsapp-light');
      setIsSaved(false);
    }
  }, [isOpen, settings]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Icon image must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setIconPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetIcon = (emoji: string, bg: string) => {
    const dataUrl = generateSvgIconDataUrl(emoji, bg);
    setIconPreview(dataUrl);
  };

  const handleSave = async () => {
    const finalName = nameInput.trim() || 'Group Chat';
    const finalIcon = iconPreview;

    // 1. Update local settings
    updateSettings({
      customAppName: finalName,
      customAppIcon: finalIcon,
      theme: selectedTheme,
    });

    // Mark customized in local storage
    localStorage.setItem('chat_branding_setup_done', 'true');
    localStorage.setItem('chat_branding_customized', 'true');

    // 2. Broadcast to server if requested so all devices/users get it
    if (syncWithServer) {
      await pushBrandingToServer({
        appName: finalName,
        appIcon: finalIcon,
        theme: selectedTheme,
      });
    }

    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleSkipOrKeepDefault = () => {
    localStorage.setItem('chat_branding_setup_done', 'true');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Banner */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-brand-subtle)',
              color: 'var(--color-brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                color: 'var(--color-text-primary)',
                margin: '0 0 4px',
              }}
            >
              {isFirstInstall ? 'Welcome! Personalize Your App' : 'Customize App Name & Logo'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              Choose an app name, iconic badge, or logo according to your community, college, friends, or company.
            </p>
          </div>
        </div>

        {/* 1. App Name Input */}
        <div>
          <label
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: 'var(--color-text-primary)',
              marginBottom: '6px',
            }}
          >
            <span>App Name</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              {nameInput.length}/40
            </span>
          </label>
          <input
            type="text"
            maxLength={40}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g., Campus Hub, Friends Chat, Work Team"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              fontSize: '0.95rem',
              outline: 'none',
              boxShadow: 'var(--shadow-xs)',
            }}
          />

          {/* Quick presets buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
              Quick ideas:
            </span>
            {PRESET_APP_NAMES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNameInput(preset)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '16px',
                  border: nameInput === preset ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                  backgroundColor: nameInput === preset ? 'var(--color-brand-subtle)' : 'var(--color-bg-elevated)',
                  color: nameInput === preset ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Choose App Logo / Icon */}
        <div>
          <label
            style={{
              display: 'block',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: 'var(--color-text-primary)',
              marginBottom: '6px',
            }}
          >
            App Logo & Iconic Badge
          </label>

          {/* Preset Iconic Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {PRESET_ICONS.map((item) => {
              const testUrl = generateSvgIconDataUrl(item.emoji, item.bg);
              const isSelected = iconPreview === testUrl;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelectPresetIcon(item.emoji, item.bg)}
                  title={item.label}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    border: isSelected ? '2.5px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                    backgroundColor: item.bg,
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px var(--color-brand-subtle)' : 'var(--shadow-xs)',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {item.emoji}
                </button>
              );
            })}
          </div>

          {/* Custom File Upload Option */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-brand-primary)',
              backgroundColor: 'var(--color-brand-subtle)',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}
              >
                {iconPreview ? (
                  <img src={iconPreview} alt="App icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src="/hivetalk-icon.svg" alt="Default icon" style={{ width: '24px', height: '24px' }} />
                )}
              </div>
              <div>
                <b style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', display: 'block' }}>
                  {iconPreview ? 'Custom Icon Selected' : 'Upload Your Own Logo'}
                </b>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  PNG, JPG, or SVG up to 2MB
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload
              </button>
              {iconPreview && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '5px 8px', fontSize: '0.78rem', color: 'var(--color-danger)' }}
                  onClick={() => setIconPreview(null)}
                  title="Reset to default icon"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Theme Accent Palette */}
        <div>
          <label
            style={{
              display: 'block',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: 'var(--color-text-primary)',
              marginBottom: '6px',
            }}
          >
            Color Theme Accent
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {[
              { id: 'whatsapp-light', name: 'Light', color: '#008069', isDark: false },
              { id: 'whatsapp-dark', name: 'Dark', color: '#00A884', isDark: true },
              { id: 'warm-brown', name: 'Warm', color: '#8B5E3C', isDark: false },
              { id: 'emerald-green', name: 'Emerald', color: '#059669', isDark: false },
              { id: 'oled-dark', name: 'OLED', color: '#38BDF8', isDark: true },
            ].map((th) => {
              const isSelected = selectedTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setSelectedTheme(th.id as AppTheme)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? `2px solid ${th.color}` : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-bg-elevated)' : 'var(--color-bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: th.color,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {th.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Live Branding Preview Card */}
        <div
          style={{
            padding: '0.9rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Live App Header Preview
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <img
                src={iconPreview || '/app-icon.svg'}
                alt="App Icon"
                style={{ width: '28px', height: '28px', borderRadius: '7px', objectFit: 'cover' }}
              />
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-brand-primary)' }}>
                {nameInput.trim() || 'Group Chat'}
              </span>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--color-brand-primary)',
                background: 'var(--color-brand-subtle)',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              Real-time Active
            </span>
          </div>
        </div>

        {/* Server Sync Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={syncWithServer}
            onChange={(e) => setSyncWithServer(e.target.checked)}
          />
          <span>Broadcast branding to server so anyone opening the invite link sees this identity</span>
        </label>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '0.25rem' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaved}
            style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={18} />
                <span>Branding Applied!</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Save & Apply Everywhere</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleSkipOrKeepDefault}
            style={{ padding: '0.85rem 1.25rem', fontSize: '0.85rem' }}
          >
            {isFirstInstall ? 'Keep Default' : 'Cancel'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
