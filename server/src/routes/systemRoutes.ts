import { Router } from 'express';
import { getIO } from '../sockets/socketServer.js';
import { localStore } from '../config/localStore.js';

export interface SystemBranding {
  appName: string;
  appIcon: string;
  appTagline: string;
  theme: string;
  publicTunnelUrl?: string;
  updatedAt: number;
}

const savedBranding = localStore.getSystemBranding();
let currentBranding: SystemBranding = savedBranding || {
  appName: process.env.APP_NAME || 'Group Chat',
  appIcon: process.env.APP_ICON || '/app-icon.svg',
  appTagline: process.env.APP_TAGLINE || 'Private group conversations, beautifully organized.',
  theme: 'whatsapp-light',
  updatedAt: Date.now(),
};

// Clean legacy HiveTalk default
if (currentBranding.appName === 'HiveTalk') {
  currentBranding.appName = 'Group Chat';
  currentBranding.appIcon = '/app-icon.svg';
  localStore.saveSystemBranding(currentBranding);
}

const router = Router();

router.get('/branding', (_req, res) => {
  res.json({ branding: currentBranding });
});

router.post('/branding', (req, res) => {
  const { appName, appIcon, appTagline, theme, publicTunnelUrl } = req.body;
  if (appName && typeof appName === 'string') {
    currentBranding.appName = appName.trim().slice(0, 40);
  }
  if (appIcon && typeof appIcon === 'string') {
    currentBranding.appIcon = appIcon;
  }
  if (appTagline && typeof appTagline === 'string') {
    currentBranding.appTagline = appTagline.trim().slice(0, 100);
  }
  if (theme && typeof theme === 'string') {
    currentBranding.theme = theme;
  }
  if (publicTunnelUrl && typeof publicTunnelUrl === 'string') {
    currentBranding.publicTunnelUrl = publicTunnelUrl.trim();
  }
  currentBranding.updatedAt = Date.now();
  localStore.saveSystemBranding(currentBranding);

  // Broadcast in real-time to all connected users
  const io = getIO();
  io?.emit('system_branding_updated', currentBranding);

  res.json({ success: true, branding: currentBranding });
});

export default router;
