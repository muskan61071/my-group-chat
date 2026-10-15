# Real-Time Group Chat Application

A production-ready, full-stack, real-time group chat web application inspired by WhatsApp Groups with custom white-label branding, instant group creation, rich messaging, voice & video calling, and encrypted invite codes.

---

## 🌟 Key Features

- **Custom White-Label Branding**:
  - Anyone running or installing the app can set their own **App Name** and upload their own **Logo/Icon** or choose from preset vector badges.
  - The branding persists to database storage and synchronizes across all users and tabs in real-time.
  - Progressive Web App (PWA) manifest and favicon dynamically adapt to your custom app name and icon when installed on mobile devices or desktop.
- **Zero Pre-Seeded Clutter**:
  - No dummy/forced groups. You and your members create and join whatever groups you want (e.g. *Friends*, *Engineering*, *Family*).
  - Clean empty state with quick "Create Group" and "Join Group" actions.
- **WhatsApp-Inspired Responsive Layout**:
  - **Header**: Notifications Bell with unread badge, Group Avatar + Group Name + Member Count, New Announcement Post, and WebRTC Voice/Video Call.
  - **Message Dock**: Emoji picker, media attachment popover (photos, videos, documents, location, contacts, payments), camera snapshot.
  - Dynamic microphone recorder with timer, smoothly transitioning to the send button when typing.
  - Real-time typing indicators, read receipts, and quoted message reply previews.
- **Rich Real-Time Messaging**:
  - Socket.IO WebSockets for sub-second message delivery.
  - Voice notes with audio waveform player and duration.
  - Photo/video lightbox and document downloads (PDF, doc, zip).
  - Emoji reactions, message editing, message pinning, delete for me / delete for everyone.
- **Canonical Group Invites**:
  - Encrypted invite codes, one-click WhatsApp sharing, direct invite links, and QR code sharing.
  - Real-time group discovery and membership sync.
- **WebRTC Voice & Video Calls**:
  - Real-time signaling via Socket.IO, active speaker indicators, mute/video/screen-share controls, and call logs.
- **Announcements Feed**:
  - Broadcast updates, admin pinned announcements, discussion threads, and emoji reactions.

---

## 🚀 Running Locally

### Development Mode:
```powershell
# In terminal 1 (Backend Express + Socket.IO server on port 8080)
cd server
npm run dev

# In terminal 2 (Vite React frontend on port 5173)
cd client
npm run dev
```

### Production Unified Mode:
Builds both frontend and backend, serving everything from a single unified Node server:
```powershell
# 1. Build client and server bundles
npm run build

# 2. Start unified production server
npm start
```
Visit `http://localhost:8080` in your web browser.

---

## 📖 Publishing & Deployment Guide

For detailed step-by-step instructions on deploying for free (Render, Railway, Docker, or VPS) and how users can install the app on mobile and desktop, see:
👉 **[docs/PUBLISHING.md](docs/PUBLISHING.md)**

---

## 🏗️ Project Architecture

```
group-chat-app/
├── client/                     # React 18 + TypeScript + Vite
│   ├── public/
│   │   └── app-icon.svg        # Default Vector App Icon
│   └── src/
│       ├── components/         # Chat, Branding Modal, Input Dock, Calls, Modals
│       ├── pages/              # Home, Chat, GroupInfo, Settings, Calls, Announcements
│       ├── services/           # Socket.IO, Auth, Groups, Messages, Calls
│       └── store/              # Settings, Auth, and Dynamic Branding Store
├── server/                     # Node.js + Express + Socket.IO
│   └── src/
│       ├── routes/             # Group, Message, Media, Call, System Branding APIs
│       ├── config/             # Local database store & persistence
│       └── sockets/            # Real-time WebSocket event broadcasts
├── shared/                     # Shared TypeScript types, constants & schemas
└── docs/                       # Complete operational and deployment documentation
```
