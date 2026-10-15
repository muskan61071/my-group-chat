// WhatsApp-Inspired Settings and Theme Store
import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { socketService } from '../services/socketService';

export type AppTheme = 'whatsapp-light' | 'whatsapp-dark' | 'warm-brown' | 'oled-dark' | 'emerald-green';
export type WallpaperType = 'doodle' | 'solid' | 'custom';
export type FontSize = 'small' | 'medium' | 'large';

export interface UserSettings {
  // Theme & Appearance
  theme: AppTheme;
  wallpaperType: WallpaperType;
  wallpaperColor: string;
  customWallpaperUrl?: string;
  showDoodle: boolean;
  dimmingLevel: number; // 0 to 100%
  fontSize: FontSize;

  // Custom App Branding (Per User/Device)
  customAppName: string;
  customAppIcon?: string | null;

  // Chat Preferences
  enterToSend: boolean;
  readReceipts: boolean;

  // Notifications
  soundEnabled: boolean;
  highPriorityNotifications: boolean;
  reactionNotifications: boolean;

  // Storage & Data
  mediaAutoDownload: boolean;

  // Profile & Status
  statusMessage: string;
  appLanguage: string;
}

export const SOLID_WALLPAPERS = [
  { name: 'WhatsApp Classic Beige', color: '#EFEAE2', dark: false },
  { name: 'WhatsApp Dark Teal', color: '#0B141A', dark: true },
  { name: 'Midnight Charcoal', color: '#182229', dark: true },
  { name: 'Pure Onyx', color: '#0F1316', dark: true },
  { name: 'Mint Green', color: '#D8F3DC', dark: false },
  { name: 'Sage Olive', color: '#DFE7DA', dark: false },
  { name: 'Soft Lavender', color: '#ECE4F9', dark: false },
  { name: 'Dusty Rose', color: '#F7DFD4', dark: false },
  { name: 'Sky Blue', color: '#DCEBFA', dark: false },
  { name: 'Warm Sand', color: '#F4EDE4', dark: false },
  { name: 'Warm Amber Brown', color: '#2A1C14', dark: true },
];

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'whatsapp-light',
  wallpaperType: 'doodle',
  wallpaperColor: '#EFEAE2',
  showDoodle: true,
  dimmingLevel: 0,
  fontSize: 'medium',
  customAppName: 'Group Chat',
  customAppIcon: null,
  enterToSend: true,
  readReceipts: true,
  soundEnabled: true,
  highPriorityNotifications: true,
  reactionNotifications: true,
  mediaAutoDownload: true,
  statusMessage: 'Hey there! I am using this chat app ✨',
  appLanguage: 'English',
};

const STORAGE_KEY = 'chat_app_settings_v3';

// Load stored settings safely
export function getSavedSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('hivetalk_app_settings_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up legacy hardcoded HiveTalk references
      if (parsed.customAppName === 'HiveTalk') {
        parsed.customAppName = 'Group Chat';
      }
      if (typeof parsed.statusMessage === 'string' && parsed.statusMessage.includes('HiveTalk')) {
        parsed.statusMessage = 'Hey there! I am using this chat app ✨';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings from storage:', e);
  }
  return DEFAULT_SETTINGS;
}

// Global subscribers for reactive settings changes
type Listener = (settings: UserSettings) => void;
const listeners = new Set<Listener>();

let currentSettings: UserSettings = getSavedSettings();

// Immediately apply saved settings to DOM on app startup
if (typeof window !== 'undefined') {
  setTimeout(() => applySettingsToDOM(currentSettings), 0);
}

export function updateSettings(partial: Partial<UserSettings>) {
  currentSettings = { ...currentSettings, ...partial };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (e) {
    console.warn('Failed to save settings to storage:', e);
  }

  // Apply to DOM directly
  applySettingsToDOM(currentSettings);

  // Notify components
  listeners.forEach((fn) => fn(currentSettings));
}

export function resetSettings() {
  updateSettings(DEFAULT_SETTINGS);
}

// Apply CSS variables, branding, and manifest to document
export function applySettingsToDOM(settings: UserSettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 1. Theme
  root.setAttribute('data-theme', settings.theme);

  // 2. Font size
  const fontSizes: Record<FontSize, string> = {
    small: '13.5px',
    medium: '15px',
    large: '16.5px',
  };
  root.style.setProperty('--chat-font-size', fontSizes[settings.fontSize] || '15px');

  // 3. Wallpaper Color & Dimming
  root.style.setProperty('--chat-wallpaper-bg', settings.wallpaperColor);
  root.style.setProperty('--chat-wallpaper-dimming', `${settings.dimmingLevel}%`);

  // 4. Custom App Branding: Title & Favicon
  const appName = settings.customAppName?.trim() || 'Group Chat';
  document.title = `${appName} | Real-Time Group Chat`;

  const iconHref = settings.customAppIcon || '/app-icon.svg';
  let iconLink = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!iconLink) {
    iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    document.head.appendChild(iconLink);
  }
  iconLink.href = iconHref;

  let appleIconLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
  if (!appleIconLink) {
    appleIconLink = document.createElement('link');
    appleIconLink.rel = 'apple-touch-icon';
    document.head.appendChild(appleIconLink);
  }
  appleIconLink.href = iconHref;

  // 5. Dynamic Web App Manifest for PWA installation
  try {
    const manifestObject = {
      name: appName,
      short_name: appName.slice(0, 15),
      start_url: '/',
      display: 'standalone',
      background_color: '#FFFFFF',
      theme_color: settings.theme.includes('dark') ? '#111B21' : '#008069',
      icons: [
        {
          src: iconHref,
          sizes: '192x192 512x512',
          type: iconHref.endsWith('.svg') || iconHref.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png',
          purpose: 'any maskable',
        },
      ],
    };

    const manifestBlob = new Blob([JSON.stringify(manifestObject)], { type: 'application/manifest+json' });
    const manifestBlobUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestBlobUrl;
  } catch {}

  // 6. Outgoing bubble accents tailored to theme
  if (settings.theme === 'whatsapp-dark') {
    root.style.setProperty('--bubble-outgoing-bg', '#005C4B');
    root.style.setProperty('--bubble-outgoing-border', '#005C4B');
    root.style.setProperty('--bubble-incoming-bg', '#202C33');
    root.style.setProperty('--bubble-incoming-border', '#222E35');
    root.style.setProperty('--color-bg-primary', '#111B21');
    root.style.setProperty('--color-bg-secondary', '#0C1317');
    root.style.setProperty('--color-bg-elevated', '#202C33');
    root.style.setProperty('--color-text-primary', '#E9EDEF');
    root.style.setProperty('--color-text-secondary', '#8696A0');
    root.style.setProperty('--color-border', '#222D34');
    root.style.setProperty('--color-border-light', '#1A2328');
    root.style.setProperty('--color-brand-primary', '#00A884');
    root.style.setProperty('--color-brand-subtle', '#18272F');
  } else if (settings.theme === 'oled-dark') {
    root.style.setProperty('--bubble-outgoing-bg', '#1F2C34');
    root.style.setProperty('--bubble-outgoing-border', '#2A3942');
    root.style.setProperty('--bubble-incoming-bg', '#121212');
    root.style.setProperty('--bubble-incoming-border', '#1E1E1E');
    root.style.setProperty('--color-bg-primary', '#000000');
    root.style.setProperty('--color-bg-secondary', '#080808');
    root.style.setProperty('--color-bg-elevated', '#141414');
    root.style.setProperty('--color-text-primary', '#FFFFFF');
    root.style.setProperty('--color-text-secondary', '#9CA3AF');
    root.style.setProperty('--color-border', '#1F2937');
    root.style.setProperty('--color-border-light', '#111827');
    root.style.setProperty('--color-brand-primary', '#00A884');
    root.style.setProperty('--color-brand-subtle', '#111B21');
  } else if (settings.theme === 'emerald-green') {
    root.style.setProperty('--bubble-outgoing-bg', '#E7FCE8');
    root.style.setProperty('--bubble-outgoing-border', '#C6F6D5');
    root.style.setProperty('--bubble-incoming-bg', '#FFFFFF');
    root.style.setProperty('--bubble-incoming-border', '#E2E8F0');
    root.style.setProperty('--color-bg-primary', '#FFFFFF');
    root.style.setProperty('--color-bg-secondary', '#F0FDF4');
    root.style.setProperty('--color-bg-elevated', '#FFFFFF');
    root.style.setProperty('--color-text-primary', '#0F172A');
    root.style.setProperty('--color-text-secondary', '#475569');
    root.style.setProperty('--color-border', '#E2E8F0');
    root.style.setProperty('--color-border-light', '#F1F5F9');
    root.style.setProperty('--color-brand-primary', '#00A884');
    root.style.setProperty('--color-brand-subtle', '#ECFDF5');
    root.style.setProperty('--color-brand-gradient', 'linear-gradient(135deg, #00A884 0%, #008069 100%)');
  } else if (settings.theme === 'whatsapp-light') {
    root.style.setProperty('--bubble-outgoing-bg', '#D9FDD3');
    root.style.setProperty('--bubble-outgoing-border', '#C2F8BB');
    root.style.setProperty('--bubble-incoming-bg', '#FFFFFF');
    root.style.setProperty('--bubble-incoming-border', '#EAE6DF');
    root.style.setProperty('--color-bg-primary', '#FFFFFF');
    root.style.setProperty('--color-bg-secondary', '#F0F2F5');
    root.style.setProperty('--color-bg-elevated', '#FFFFFF');
    root.style.setProperty('--color-text-primary', '#111B21');
    root.style.setProperty('--color-text-secondary', '#667781');
    root.style.setProperty('--color-border', '#E9EDEF');
    root.style.setProperty('--color-border-light', '#F2F5F8');
    root.style.setProperty('--color-brand-primary', '#008069');
    root.style.setProperty('--color-brand-subtle', '#E7F8F4');
    root.style.setProperty('--color-brand-hover', '#00705B');
    root.style.setProperty('--color-brand-gradient', 'linear-gradient(135deg, #00A884 0%, #008069 100%)');
  } else {
    // Warm Brown Signature
    root.style.setProperty('--bubble-outgoing-bg', '#F2E3D8');
    root.style.setProperty('--bubble-outgoing-border', '#DEC8BA');
    root.style.setProperty('--bubble-incoming-bg', '#FFFFFF');
    root.style.setProperty('--bubble-incoming-border', '#E8DBD1');
    root.style.setProperty('--color-bg-primary', '#FFFFFF');
    root.style.setProperty('--color-bg-secondary', '#FAF7F4');
    root.style.setProperty('--color-bg-elevated', '#FFFFFF');
    root.style.setProperty('--color-text-primary', '#2D1F17');
    root.style.setProperty('--color-text-secondary', '#6A5447');
    root.style.setProperty('--color-border', '#EADBCC');
    root.style.setProperty('--color-border-light', '#F2E8DF');
    root.style.setProperty('--color-brand-primary', '#8B5E3C');
    root.style.setProperty('--color-brand-subtle', '#F8F1EB');
    root.style.setProperty('--color-brand-gradient', 'linear-gradient(135deg, #8B5E3C 0%, #6F472B 100%)');
  }
}

// Initial application on file load
applySettingsToDOM(currentSettings);

// Custom React hook to consume settings
export function useSettings(): [UserSettings, (partial: Partial<UserSettings>) => void] {
  const [state, setState] = useState<UserSettings>(currentSettings);

  useEffect(() => {
    const handler = (newSettings: UserSettings) => setState(newSettings);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return [state, updateSettings];
}

// Fetch centralized system branding from server
export async function syncServerBranding() {
  try {
    const res = await apiClient.get('/api/system/branding');
    const b = res.data?.branding;
    if (b && b.appName && b.appName !== 'HiveTalk') {
      const isLocallyCustomized = localStorage.getItem('chat_branding_customized');
      if (!isLocallyCustomized || currentSettings.customAppName === 'Group Chat') {
        updateSettings({
          customAppName: b.appName,
          customAppIcon: b.appIcon || null,
        });
      }
    }
  } catch (err) {
    // Silent fail if server unreachable
  }
}

// Push app branding changes to server so all users & devices update in real-time
export async function pushBrandingToServer(data: {
  appName: string;
  appIcon?: string | null;
  appTagline?: string;
  theme?: string;
}) {
  try {
    await apiClient.post('/api/system/branding', data);
  } catch (err) {
    console.warn('Could not sync branding to server:', err);
  }
}

// Initialize server sync and real-time socket updates
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncServerBranding();

    const socket = socketService.getSocket();
    if (socket) {
      socket.on('system_branding_updated', (b: any) => {
        if (b?.appName && b.appName !== 'HiveTalk') {
          updateSettings({
            customAppName: b.appName,
            customAppIcon: b.appIcon || null,
          });
        }
      });
    }
  }, 500);
}

