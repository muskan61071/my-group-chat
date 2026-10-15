import React from 'react';
import { Download, Smartphone, Laptop, Sparkles, Share2, PlusSquare, Check } from 'lucide-react';
import { Modal } from './Modal';
import { useSettings } from '../../store/settingsStore';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  canPromptDirectly?: boolean;
  onNativePrompt?: () => void;
}

export function InstallGuideModal({
  isOpen,
  onClose,
  canPromptDirectly,
  onNativePrompt,
}: InstallGuideModalProps) {
  const [settings] = useSettings();
  const appName = settings.customAppName || 'Group Chat';
  const appIcon = settings.customAppIcon || '/app-icon.svg';

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: boolean }).MSStream;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header with App Branding Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
          <img
            src={appIcon}
            alt={appName}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                Install {appName}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
              Add to your device home screen with your custom name & icon
            </p>
          </div>
        </div>

        {/* 1-Click Native Prompt if available */}
        {canPromptDirectly && (
          <div style={{ backgroundColor: 'var(--color-brand-subtle)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--color-border)' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
              ⚡ 1-Click Fast Install Available
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onNativePrompt?.();
                onClose();
              }}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              <Download size={18} />
              <span>Install "{appName}" Now</span>
            </button>
          </div>
        )}

        {/* Device-Specific Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
            Installation Steps:
          </h3>

          {/* iPhone / iPad (iOS) */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: isIOS ? 'var(--color-brand-subtle)' : 'var(--color-bg-secondary)',
              border: isIOS ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Smartphone size={16} style={{ color: 'var(--color-brand-primary)' }} />
              <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                iPhone / iPad (Safari)
              </strong>
            </div>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <li>
                Tap the <b>Share</b> button (<Share2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> square with arrow) in Safari.
              </li>
              <li>
                Scroll down and tap <b>"Add to Home Screen"</b> (<PlusSquare size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />).
              </li>
              <li>Confirm the name <b>"{appName}"</b> and tap <b>Add</b>.</li>
            </ol>
          </div>

          {/* Android (Chrome) */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: !isIOS ? 'var(--color-brand-subtle)' : 'var(--color-bg-secondary)',
              border: !isIOS ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Smartphone size={16} style={{ color: 'var(--color-brand-primary)' }} />
              <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                Android (Chrome)
              </strong>
            </div>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <li>Tap the three dots <b>⋮</b> menu in the top right.</li>
              <li>Tap <b>"Install app"</b> or <b>"Add to Home screen"</b>.</li>
              <li>Tap <b>Install</b> to place "{appName}" on your home screen.</li>
            </ol>
          </div>

          {/* Desktop (Chrome / Edge / Mac) */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Laptop size={16} style={{ color: 'var(--color-brand-primary)' }} />
              <strong style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                Desktop (Windows, Mac, Chrome, Edge)
              </strong>
            </div>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <li>Click the <b>Install</b> icon on the right side of your browser address bar.</li>
              <li>Click <b>Install</b> to run "{appName}" as a standalone desktop app.</li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('open_app_branding_modal'));
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-brand-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} />
            <span>Change App Name First</span>
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
