import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Key,
  Lock,
  MessageSquare,
  Bell,
  HardDrive,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  QrCode,
  Palette,
  Image as ImageIcon,
  Check,
  Upload,
  Sun,
  Moon,
  Sparkles,
  Type,
  ShieldCheck,
  Smartphone,
  Trash2,
  Users,
  Share2,
  MessageCircle,
  Copy,
} from 'lucide-react';
import { logout } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import {
  useSettings,
  SOLID_WALLPAPERS,
  AppTheme,
  FontSize,
  pushBrandingToServer,
} from '../store/settingsStore';

type SettingsView =
  | 'main'
  | 'branding'
  | 'theme'
  | 'wallpaper'
  | 'appearance'
  | 'account'
  | 'privacy'
  | 'notifications'
  | 'storage';

export function Settings() {
  const navigate = useNavigate();
  const currentUser = useAuth();
  const [settings, updateSettings] = useSettings();

  // Active view: separate screens for branding, theme, wallpaper, appearance, etc.
  const [currentView, setCurrentView] = useState<SettingsView>('main');

  // Custom Branding State
  const [appNameInput, setAppNameInput] = useState(settings.customAppName || 'Group Chat');
  const [appIconPreview, setAppIconPreview] = useState<string | null>(settings.customAppIcon || null);
  const [brandToast, setBrandToast] = useState('');
  const customAppIconInputRef = useRef<HTMLInputElement | null>(null);

  // Modals
  const [showUserQR, setShowUserQR] = useState(false);
  const [showInviteFriendModal, setShowInviteFriendModal] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const customWallpaperInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogout = async () => {
    if (confirm(`Are you sure you want to sign out of ${settings.customAppName || 'the app'}?`)) {
      await logout();
      navigate('/login');
    }
  };

  const handleCustomWallpaperUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        updateSettings({
          wallpaperType: 'custom',
          customWallpaperUrl: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const getThemeName = (theme: AppTheme) => {
    switch (theme) {
      case 'whatsapp-light':
        return 'WhatsApp Light';
      case 'whatsapp-dark':
        return 'WhatsApp Dark';
      case 'warm-brown':
        return 'Warm Brown';
      case 'emerald-green':
        return 'Emerald Classic';
      case 'oled-dark':
        return 'OLED Midnight';
      default:
        return 'Default';
    }
  };

  const getWallpaperName = () => {
    if (settings.wallpaperType === 'custom') return 'Custom Photo';
    const found = SOLID_WALLPAPERS.find((s) => s.color.toLowerCase() === settings.wallpaperColor.toLowerCase());
    return found ? found.name : 'Custom Color';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg-secondary)',
      }}
    >
      {/* WhatsApp Header */}
      <header className="main-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className="btn-icon"
            onClick={() => {
              if (currentView !== 'main') {
                setCurrentView('main');
              } else {
                navigate('/');
              }
            }}
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                color: 'var(--color-text-primary)',
              }}
            >
              {currentView === 'main' && 'Settings'}
              {currentView === 'branding' && 'Customize App'}
              {currentView === 'theme' && 'Chat Theme'}
              {currentView === 'wallpaper' && 'Chat Wallpaper'}
              {currentView === 'appearance' && 'Chat Appearance'}
              {currentView === 'privacy' && 'Privacy'}
              {currentView === 'account' && 'Account'}
              {currentView === 'notifications' && 'Notifications'}
              {currentView === 'storage' && 'Storage and Data'}
            </h1>
            <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              {currentView === 'main' && 'Profile, chat appearance, privacy'}
              {currentView === 'branding' && 'Custom name, icon & app branding'}
              {currentView === 'theme' && 'App palette & visual mode'}
              {currentView === 'wallpaper' && 'Background colors & doodle artwork'}
              {currentView === 'appearance' && 'Text size & chat controls'}
              {currentView === 'privacy' && 'Read receipts & security'}
              {currentView === 'account' && 'Security notifications'}
              {currentView === 'notifications' && 'Message tones & alerts'}
              {currentView === 'storage' && 'Data & cache'}
            </small>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem max(1rem, calc((100% - 680px) / 2))' }}>
        {/* ============================================================ */}
        {/* VIEW 1: MAIN SETTINGS MENU                                   */}
        {/* ============================================================ */}
        {currentView === 'main' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* WhatsApp Profile Card */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  flex: 1,
                  minWidth: 0,
                }}
                onClick={() => navigate('/profile')}
                title="View Profile"
              >
                <div style={{ position: 'relative' }}>
                  <Avatar
                    src={currentUser?.photoURL}
                    name={currentUser?.displayName || 'User'}
                    size={60}
                    isOnline={true}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2
                    style={{
                      fontSize: '1.15rem',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {currentUser?.displayName || 'User'}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--color-text-muted)',
                      margin: '4px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {settings.statusMessage}
                  </p>
                </div>
              </div>

              {/* Personal QR Code Button */}
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowUserQR(true)}
                title="View my QR code"
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: 'var(--color-brand-subtle)',
                  color: 'var(--color-brand-primary)',
                  borderRadius: '50%',
                }}
              >
                <QrCode size={20} />
              </button>
            </div>

            {/* WhatsApp Navigation Menu List */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              {/* 0. CUSTOMIZE APP BRANDING */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                  backgroundColor: 'var(--color-brand-subtle)',
                }}
                onClick={() => {
                  setAppNameInput(settings.customAppName || 'Group Chat');
                  setAppIconPreview(settings.customAppIcon || null);
                  setCurrentView('branding');
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-brand-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Customize App
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Name: <b>{settings.customAppName || 'Group Chat'}</b> · Custom App Icon
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {/* 1. SEPARATE CHAT THEME OPTION */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => setCurrentView('theme')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Palette size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Chat Theme
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {getThemeName(settings.theme)}
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {/* 2. SEPARATE CHAT WALLPAPER OPTION */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => setCurrentView('wallpaper')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ImageIcon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Chat Wallpaper
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {getWallpaperName()} {settings.showDoodle ? '· Doodle enabled' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: settings.wallpaperColor,
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'inline-block',
                    }}
                  />
                  <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>

              {/* 3. SEPARATE CHAT APPEARANCE OPTION */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => setCurrentView('appearance')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Type size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Chat Appearance
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Font size: {settings.fontSize} · Enter is send: {settings.enterToSend ? 'On' : 'Off'}
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {/* Account */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => setCurrentView('account')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Key size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Account
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Security notifications, PIN protection
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {/* Privacy */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => setCurrentView('privacy')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#F3E8FF',
                    color: '#A855F7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lock size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Privacy
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Read receipts, last seen, disappearing messages
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {/* Notifications */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => setCurrentView('notifications')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#FDF2F8',
                    color: '#EC4899',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Notifications
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Message tones, group & reaction alerts
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {/* Storage and Data */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => setCurrentView('storage')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#EDE9FE',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HardDrive size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Storage and Data
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Network usage, local cache, media auto-download
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {/* App Language */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => {
                  const langs = ['English', 'Español', 'Français', 'Deutsch', 'Hindi', 'Português'];
                  const nextIdx = (langs.indexOf(settings.appLanguage) + 1) % langs.length;
                  updateSettings({ appLanguage: langs[nextIdx] });
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    App Language
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {settings.appLanguage} (system language)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--color-brand-primary)',
                    fontWeight: 600,
                  }}
                >
                  {settings.appLanguage}
                </span>
              </div>

              {/* Help & About */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => alert(`${settings.customAppName || 'Group Chat'} Messenger v2.4.0\nReal-Time Group Chat Application.`)}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HelpCircle size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Help
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Help center, terms and privacy policy, licenses
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>

              {/* Invite a friend (WhatsApp Style) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  gap: '1rem',
                }}
                onClick={() => setShowInviteFriendModal(true)}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '0.95rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    Invite a friend
                  </b>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Share link, QR code, or invite via WhatsApp
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              className="btn-danger"
              style={{ justifyContent: 'center', width: '100%', padding: '0.85rem' }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: SEPARATE CHAT THEME VIEW                             */}
        {/* ============================================================ */}
        {currentView === 'theme' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <Palette size={22} style={{ color: 'var(--color-brand-primary)' }} />
                <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-text-primary)' }}>
                  Select Theme
                </h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Choose the color palette and lighting mode for the app interface. Note: Changing theme will not modify or reset your chat wallpaper.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {[
                  {
                    id: 'whatsapp-light',
                    name: 'WhatsApp Light',
                    desc: 'Clean & Bright',
                    icon: <Sun size={20} />,
                    bg: '#FFFFFF',
                    accent: '#008069',
                    border: '#008069',
                  },
                  {
                    id: 'whatsapp-dark',
                    name: 'WhatsApp Dark',
                    desc: 'Authentic Teal Dark',
                    icon: <Moon size={20} />,
                    bg: '#111B21',
                    accent: '#00A884',
                    border: '#00A884',
                  },
                  {
                    id: 'warm-brown',
                    name: 'Warm Brown',
                    desc: 'Signature Elegance',
                    icon: <Sparkles size={20} />,
                    bg: '#FAF7F4',
                    accent: '#8B5E3C',
                    border: '#8B5E3C',
                  },
                  {
                    id: 'emerald-green',
                    name: 'Emerald Classic',
                    desc: 'Mint Modern',
                    icon: <Sun size={20} />,
                    bg: '#F0FDF4',
                    accent: '#059669',
                    border: '#059669',
                  },
                  {
                    id: 'oled-dark',
                    name: 'OLED Midnight',
                    desc: 'True Black Contrast',
                    icon: <Moon size={20} />,
                    bg: '#000000',
                    accent: '#38BDF8',
                    border: '#38BDF8',
                  },
                ].map((item) => {
                  const isSelected = settings.theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateSettings({ theme: item.id as AppTheme })}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '8px',
                        padding: '1.1rem 0.75rem',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected ? `2.5px solid ${item.accent}` : '1px solid var(--color-border)',
                        backgroundColor: item.bg,
                        color: item.id.includes('dark') ? '#FFFFFF' : '#1F2937',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 14px rgba(0,0,0,0.12)' : 'var(--shadow-sm)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: item.accent,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <b style={{ fontSize: '0.88rem', display: 'block' }}>{item.name}</b>
                        <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{item.desc}</span>
                      </div>
                      {isSelected ? (
                        <div
                          style={{
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: item.accent,
                          }}
                        >
                          <Check size={14} /> Active
                        </div>
                      ) : (
                        <div style={{ height: '18px' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Theme description badge */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.84rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <b>Current Theme:</b> {getThemeName(settings.theme)}
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Theme styles UI controls, header bar, action buttons, and incoming/outgoing bubble colors. Your wallpaper settings remain independent.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: SEPARATE CHAT WALLPAPER VIEW                         */}
        {/* ============================================================ */}
        {currentView === 'wallpaper' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={22} style={{ color: 'var(--color-brand-primary)' }} />
                  <div>
                    <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-text-primary)' }}>
                      Chat Wallpaper
                    </h2>
                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      Applies to all group and direct conversations
                    </small>
                  </div>
                </div>

                {/* Toggle WhatsApp Doodle Pattern */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-bg-secondary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.showDoodle}
                    onChange={(e) => updateSettings({ showDoodle: e.target.checked })}
                  />
                  <span>WhatsApp Doodle</span>
                </label>
              </div>

              {/* Solid Color Palette Swatches */}
              <p
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.75rem',
                }}
              >
                Curated WhatsApp Solid Colors:
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {SOLID_WALLPAPERS.map((swatch) => {
                  const isSelected =
                    settings.wallpaperColor.toLowerCase() === swatch.color.toLowerCase() &&
                    settings.wallpaperType !== 'custom';
                  return (
                    <button
                      key={swatch.color}
                      type="button"
                      onClick={() =>
                        updateSettings({
                          wallpaperType: 'solid',
                          wallpaperColor: swatch.color,
                        })
                      }
                      title={swatch.name}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: swatch.color,
                        border: isSelected
                          ? '3px solid var(--color-brand-primary)'
                          : '2px solid rgba(0,0,0,0.12)',
                        boxShadow: isSelected ? '0 0 0 2px var(--color-bg-primary)' : 'var(--shadow-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.15s ease',
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {isSelected && (
                        <Check size={20} style={{ color: swatch.dark ? '#FFFFFF' : '#1F2937' }} />
                      )}
                    </button>
                  );
                })}

                {/* Custom Photo Wallpaper Upload Button */}
                <input
                  ref={customWallpaperInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleCustomWallpaperUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => customWallpaperInputRef.current?.click()}
                  title="Upload custom photo wallpaper"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-brand-subtle)',
                    color: 'var(--color-brand-primary)',
                    border:
                      settings.wallpaperType === 'custom'
                        ? '3px solid var(--color-brand-primary)'
                        : '2px dashed var(--color-brand-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: settings.wallpaperType === 'custom' ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  <Upload size={18} />
                </button>

                {/* Reset Custom Photo if active */}
                {settings.wallpaperType === 'custom' && (
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        wallpaperType: 'doodle',
                        wallpaperColor: '#EFEAE2',
                        customWallpaperUrl: undefined,
                      })
                    }
                    title="Remove custom photo"
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0 10px', height: '44px' }}
                  >
                    <Trash2 size={14} /> Remove Photo
                  </button>
                )}
              </div>

              {/* Wallpaper Dimming Slider */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  marginBottom: '1.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <b>Wallpaper Dimming</b>
                  <span style={{ color: 'var(--color-brand-primary)', fontWeight: 700 }}>
                    {settings.dimmingLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={settings.dimmingLevel}
                  onChange={(e) => updateSettings({ dimmingLevel: Number(e.target.value) })}
                  style={{ accentColor: 'var(--color-brand-primary)', cursor: 'pointer' }}
                />
              </div>

              {/* LIVE CHAT WALLPAPER PREVIEW */}
              <div>
                <p
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.65rem',
                  }}
                >
                  Live Wallpaper Preview:
                </p>

                <div
                  style={{
                    position: 'relative',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    backgroundColor: settings.wallpaperColor,
                    backgroundImage:
                      settings.wallpaperType === 'custom' && settings.customWallpaperUrl
                        ? `url(${settings.customWallpaperUrl})`
                        : settings.showDoodle
                        ? 'radial-gradient(rgba(0,0,0,0.12) 1.2px, transparent 1.2px)'
                        : 'none',
                    backgroundSize: settings.wallpaperType === 'custom' ? 'cover' : '24px 24px',
                    backgroundPosition: 'center',
                    padding: '1.5rem',
                    boxShadow: 'inset 0 0 16px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    minHeight: '180px',
                  }}
                >
                  {/* Dimming overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'black',
                      opacity: settings.dimmingLevel / 100,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Sample Incoming Bubble */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      alignSelf: 'flex-start',
                      maxWidth: '82%',
                    }}
                  >
                    <div
                      className="message-bubble incoming"
                      style={{ fontSize: 'var(--chat-font-size)', padding: '0.6rem 0.9rem' }}
                    >
                      <b
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--color-brand-primary)',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        Alex Rivera
                      </b>
                      <span>Hey! This wallpaper looks amazing in real-time ✨</span>
                      <small
                        style={{
                          display: 'block',
                          textAlign: 'right',
                          fontSize: '0.68rem',
                          opacity: 0.65,
                          marginTop: '2px',
                        }}
                      >
                        10:42 AM
                      </small>
                    </div>
                  </div>

                  {/* Sample Outgoing Bubble */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      alignSelf: 'flex-end',
                      maxWidth: '82%',
                    }}
                  >
                    <div
                      className="message-bubble mine"
                      style={{ fontSize: 'var(--chat-font-size)', padding: '0.6rem 0.9rem' }}
                    >
                      <span>Yes, and it persists even when switching themes! 🐝</span>
                      <small
                        style={{
                          display: 'block',
                          textAlign: 'right',
                          fontSize: '0.68rem',
                          opacity: 0.65,
                          marginTop: '2px',
                        }}
                      >
                        10:43 AM · ✓✓
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: SEPARATE CHAT APPEARANCE VIEW                        */}
        {/* ============================================================ */}
        {currentView === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
                display: 'grid',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={22} style={{ color: 'var(--color-brand-primary)' }} />
                <div>
                  <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-text-primary)' }}>
                    Chat Appearance & Font Size
                  </h2>
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                    Adjust text sizing, keyboard behavior, and media
                  </small>
                </div>
              </div>

              {/* Font Size Selector */}
              <div>
                <b style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Message Font Size
                </b>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  {(['small', 'medium', 'large'] as FontSize[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={settings.fontSize === sz ? 'btn-primary' : 'btn-secondary'}
                      style={{ justifyContent: 'center', textTransform: 'capitalize', padding: '0.75rem' }}
                      onClick={() => updateSettings({ fontSize: sz })}
                    >
                      {sz} {sz === 'medium' ? '(Standard)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Preview Card */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div
                  className="message-bubble incoming"
                  style={{
                    fontSize: 'var(--chat-font-size)',
                    padding: '0.6rem 0.9rem',
                    maxWidth: '85%',
                  }}
                >
                  <span>Sample text message displayed at {settings.fontSize} font size.</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />

              {/* Enter is Send */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <b style={{ color: 'var(--color-text-primary)' }}>Enter is Send</b>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Enter key sends immediately; Shift + Enter creates a new line
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enterToSend}
                  onChange={(e) => updateSettings({ enterToSend: e.target.checked })}
                />
              </label>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />

              {/* Media Auto Download */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <b style={{ color: 'var(--color-text-primary)' }}>Media Auto-Download</b>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Automatically fetch image attachments and audio notes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.mediaAutoDownload}
                  onChange={(e) => updateSettings({ mediaAutoDownload: e.target.checked })}
                />
              </label>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 5: PRIVACY                                              */}
        {/* ============================================================ */}
        {currentView === 'privacy' && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              display: 'grid',
              gap: '1.25rem',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>Read Receipts</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Show double checkmarks when messages are seen
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.readReceipts}
                onChange={(e) => updateSettings({ readReceipts: e.target.checked })}
              />
            </label>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>Last Seen & Online</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Visible to everyone
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>Disappearing Messages Timer</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Off (default)
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 6: NOTIFICATIONS                                        */}
        {/* ============================================================ */}
        {currentView === 'notifications' && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              display: 'grid',
              gap: '1.25rem',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>Conversation Tones</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Play audio sounds for incoming and outgoing messages
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              />
            </label>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>High Priority Alerts</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Show preview banners for direct and urgent group mentions
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.highPriorityNotifications}
                onChange={(e) => updateSettings({ highPriorityNotifications: e.target.checked })}
              />
            </label>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>Reaction Notifications</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Show notifications when someone reacts to your messages
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.reactionNotifications}
                onChange={(e) => updateSettings({ reactionNotifications: e.target.checked })}
              />
            </label>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 7: STORAGE & DATA                                       */}
        {/* ============================================================ */}
        {currentView === 'storage' && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              display: 'grid',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>Network Usage & Local Cache</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Offline cached chats, media files & attachments
                </p>
              </div>
              <button
                className="btn-secondary"
                style={{ fontSize: '0.8rem' }}
                onClick={() => alert('Local cache cleared successfully!')}
              >
                Clear Cache
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 8: ACCOUNT                                              */}
        {/* ============================================================ */}
        {currentView === 'account' && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              display: 'grid',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={22} style={{ color: '#10B981' }} />
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>Security Notifications</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Get notified when your encryption or security code changes
                </p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Smartphone size={22} style={{ color: '#3B82F6' }} />
              <div>
                <b style={{ color: 'var(--color-text-primary)' }}>Two-Step Verification</b>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  PIN protection active for account and session recovery
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 9: CUSTOMIZE APP BRANDING (PER-USER/DEVICE)             */}
        {/* ============================================================ */}
        {currentView === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
                display: 'grid',
                gap: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                  <Sparkles size={22} style={{ color: 'var(--color-brand-primary)' }} />
                  <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-text-primary)' }}>
                    Customize App Branding
                  </h2>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Personalize the application name and icon on your device. These settings are stored locally for your installation and will not alter other users' branding.
                </p>
              </div>

              {brandToast && (
                <div
                  className="animate-slide-up"
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  <Check size={18} />
                  <span>{brandToast}</span>
                </div>
              )}

              {/* 1. APP NAME INPUT */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  App Name
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  placeholder="e.g., My Friends, College Chat, Family Hub"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-secondary)',
                  }}
                />

                {/* Quick suggestions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                    Quick presets:
                  </span>
                  {['Group Chat', 'My Friends', 'College Chat', 'Family Hub', 'Work Team', 'Study Group'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAppNameInput(preset)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: appNameInput === preset ? 'var(--color-brand-primary)' : 'var(--color-bg-elevated)',
                        color: appNameInput === preset ? 'white' : 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. APP ICON SELECTION */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  App Icon
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {/* Current Icon Preview */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      backgroundColor: 'var(--color-brand-subtle)',
                      border: '2px solid var(--color-brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {appIconPreview ? (
                      <img src={appIconPreview} alt="App Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src="/app-icon.svg" alt="Default Icon" style={{ width: '40px', height: '40px' }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      ref={customAppIconInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const res = ev.target?.result as string;
                            if (res) setAppIconPreview(res);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => customAppIconInputRef.current?.click()}
                      style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                    >
                      <Upload size={16} />
                      <span>Upload Custom Icon</span>
                    </button>

                    {appIconPreview && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setAppIconPreview(null)}
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: 'var(--color-danger)' }}
                      >
                        Reset Icon
                      </button>
                    )}
                  </div>
                </div>

                {/* Preset SVG Icons */}
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    Or select an icon badge:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Bee', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%238B5E3C"/><text x="50" y="65" font-size="50" text-anchor="middle">🐝</text></svg>' },
                      { label: 'Chat', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23008069"/><text x="50" y="65" font-size="50" text-anchor="middle">💬</text></svg>' },
                      { label: 'Rocket', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%233B82F6"/><text x="50" y="65" font-size="50" text-anchor="middle">🚀</text></svg>' },
                      { label: 'Graduation', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%236366F1"/><text x="50" y="65" font-size="50" text-anchor="middle">🎓</text></svg>' },
                      { label: 'House', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%2310B981"/><text x="50" y="65" font-size="50" text-anchor="middle">🏡</text></svg>' },
                      { label: 'Briefcase', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%230F172A"/><text x="50" y="65" font-size="50" text-anchor="middle">💼</text></svg>' },
                      { label: 'Star', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23F59E0B"/><text x="50" y="65" font-size="50" text-anchor="middle">⭐</text></svg>' },
                      { label: 'Heart', data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23EC4899"/><text x="50" y="65" font-size="50" text-anchor="middle">❤️</text></svg>' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setAppIconPreview(item.data)}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          border: appIconPreview === item.data ? '2.5px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
                          padding: '2px',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                        title={item.label}
                      >
                        <img src={item.data} alt={item.label} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. LIVE PREVIEW CARD */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '1.25rem',
                }}
              >
                <b style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', display: 'block', marginBottom: '8px' }}>
                  Live Branding Preview
                </b>

                {/* Simulated Browser Tab */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px 8px 0 0',
                    border: '1px solid var(--color-border)',
                    borderBottom: 'none',
                    maxWidth: '260px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#374151',
                  }}
                >
                  <img
                    src={appIconPreview || '/app-icon.svg'}
                    alt="Favicon"
                    style={{ width: '16px', height: '16px', borderRadius: '4px' }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appNameInput.trim() || settings.customAppName || 'Group Chat'} | Real-Time Group Chat
                  </span>
                </div>

                {/* Simulated Header Banner */}
                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '12px 16px',
                    borderRadius: '0 8px 8px 8px',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={appIconPreview || '/app-icon.svg'}
                      alt="Brand Icon"
                      style={{ width: '28px', height: '28px', borderRadius: '7px' }}
                    />
                    <b style={{ fontSize: '1.05rem', color: 'var(--color-brand-primary)' }}>
                      {appNameInput.trim() || settings.customAppName || 'Group Chat'}
                    </b>
                  </div>
                  <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    Live
                  </span>
                </div>
              </div>

              {/* 4. ACTIONS */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
                  onClick={async () => {
                    const finalName = appNameInput.trim() || settings.customAppName || 'Group Chat';
                    updateSettings({
                      customAppName: finalName,
                      customAppIcon: appIconPreview,
                    });
                    localStorage.setItem('chat_branding_customized', 'true');
                    await pushBrandingToServer({
                      appName: finalName,
                      appIcon: appIconPreview,
                    });
                    setBrandToast(`App branded as "${finalName}"!`);
                    setTimeout(() => setBrandToast(''), 3000);
                  }}
                >
                  <Check size={18} />
                  <span>Save Branding</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '0.85rem 1.25rem' }}
                  onClick={async () => {
                    setAppNameInput('Group Chat');
                    setAppIconPreview(null);
                    updateSettings({
                      customAppName: 'Group Chat',
                      customAppIcon: null,
                    });
                    localStorage.removeItem('chat_branding_customized');
                    await pushBrandingToServer({
                      appName: 'Group Chat',
                      appIcon: null,
                    });
                    setBrandToast('Reset to default branding.');
                    setTimeout(() => setBrandToast(''), 3000);
                  }}
                >
                  Reset Defaults
                </button>
              </div>

              {/* 5. TECHNICAL NOTICE */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                <b>Technical Notice on Platform Support:</b>
                <ul style={{ margin: '6px 0 0', paddingLeft: '1.2rem' }}>
                  <li><b>Browser Tab & Favicon:</b> Updated immediately in real-time on this device.</li>
                  <li><b>In-App Headers & UI:</b> Updated immediately across all screens and chats.</li>
                  <li><b>PWA Installation Manifest:</b> Updated dynamically with your custom name and icon for new installations.</li>
                  <li><b>Operating System Launcher Icon:</b> Android and iOS freeze the home screen icon at the time the PWA is added to the home screen. To refresh your home screen launcher icon, re-add the app to your Home Screen after saving.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* USER PERSONAL QR CODE MODAL */}
      <Modal isOpen={showUserQR} onClose={() => setShowUserQR(false)} title="My Contact QR Code">
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
            }}
          >
            Your personal QR code. Other users can scan this to find and message you directly.
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '20px',
              border: '2px solid var(--color-border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
          >
            <QRCodeSVG
              value={`${window.location.origin}/search?q=${encodeURIComponent(
                currentUser?.email || currentUser?.uid || ''
              )}`}
              size={220}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <b style={{ fontSize: '1.1rem', color: 'var(--color-brand-primary)' }}>
              {currentUser?.displayName || currentUser?.email}
            </b>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {settings.statusMessage}
            </p>
          </div>
        </div>
      </Modal>

      {/* INVITE A FRIEND MODAL (WHATSAPP STYLE) */}
      <Modal isOpen={showInviteFriendModal} onClose={() => setShowInviteFriendModal(false)} title={`Invite a Friend to ${settings.customAppName || 'Chat'}`}>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
            }}
          >
            Invite your friends and team members to join you on {settings.customAppName || 'the app'} for real-time group conversations and calling.
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '20px',
              border: '2px solid var(--color-border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              marginBottom: '1.25rem',
            }}
          >
            <QRCodeSVG
              value={window.location.origin}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#FFFFFF"
            />
          </div>

          {/* Link box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '1.25rem',
              backgroundColor: 'var(--color-bg-secondary)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-light)',
            }}
          >
            <input
              type="text"
              readOnly
              value={window.location.origin}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '0.82rem',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                setCopiedAppUrl(true);
                setTimeout(() => setCopiedAppUrl(false), 2000);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              {copiedAppUrl ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}
              <span>{copiedAppUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-primary"
              style={{
                backgroundColor: '#25D366',
                borderColor: '#25D366',
                color: '#FFFFFF',
                justifyContent: 'center',
                padding: '0.65rem',
                fontSize: '0.84rem',
                gap: '6px',
              }}
              onClick={() => {
                const appTitle = settings.customAppName || 'Chat';
                const text = `Join me on ${appTitle}! Click here to start chatting: ${window.location.origin}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
            >
              <MessageCircle size={16} />
              <span>Share via WhatsApp</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{
                justifyContent: 'center',
                padding: '0.65rem',
                fontSize: '0.84rem',
                gap: '6px',
              }}
              onClick={() => {
                const appTitle = settings.customAppName || 'Chat';
                if (navigator.share) {
                  navigator.share({
                    title: `Join me on ${appTitle}`,
                    text: `Join me on ${appTitle} for secure real-time messaging & calls!`,
                    url: window.location.origin,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.origin);
                  setCopiedAppUrl(true);
                  setTimeout(() => setCopiedAppUrl(false), 2000);
                }
              }}
            >
              <Share2 size={16} />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
