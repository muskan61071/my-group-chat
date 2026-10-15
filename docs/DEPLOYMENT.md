# HiveTalk — Deployment & Publishing Guide

This guide explains how to build, publish, and deploy **HiveTalk** to the cloud or share it online with friends and colleagues.

---

## 🏗️ Architecture Overview

HiveTalk is built with:
- **Frontend Client**: React 18 + Vite + TypeScript (builds static files to `client/dist`).
- **Backend Server**: Node.js + Express + Socket.IO for real-time chat, calls & WebRTC signaling (runs on port `8080` or `process.env.PORT`).

The server is configured to **automatically serve the client frontend** from `client/dist` when in production! This means you can deploy the entire application as a **single unified web service** without dealing with domain mismatches or complex CORS issues.

---

## 🚀 Option 1: All-in-One Deployment (Render / Railway / VPS) — Recommended

Deploy frontend, backend API, and real-time WebSockets together under one URL for free.

### Deploying on [Render.com](https://render.com) (Free Tier with WebSockets)

1. Push your repository to **GitHub** or **GitLab**.
2. Go to **Render Dashboard** → click **New +** → select **Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Name**: `hivetalk`
   - **Environment**: `Node`
   - **Region**: Closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root of repo)
   - **Build Command**:
     ```bash
     cd client && npm install && npm run build && cd ../server && npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     cd server && node dist/server.js
     ```
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render assigns PORT automatically)
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide a live URL like `https://hivetalk.onrender.com`. Visiting this URL loads the full React client, and real-time chat connects automatically!

---

## ⚡ Option 2: Split Deployment (Firebase Hosting + Backend on Render/Railway)

If you prefer serving the frontend via Google's Global CDN (Firebase Hosting):

### Step 1: Deploy Frontend to Firebase Hosting
1. Install Firebase tools or use npx:
   ```powershell
   npx firebase-tools login
   ```
2. Build the client bundle:
   ```powershell
   npm run build:client
   ```
3. Deploy to Firebase:
   ```powershell
   npm run deploy:firebase
   ```
   Your static site will be live at `https://hivetalk-chat-app.web.app` (or your configured project).

### Step 2: Point Client to Your Production Server
In `client/.env.production` (or during build), set your deployed server URL:
```env
VITE_API_URL=https://your-server.onrender.com/api
VITE_SOCKET_URL=https://your-server.onrender.com
```
Re-run `npm run deploy:firebase` to publish the updated configuration.

---

## 🌐 Option 3: Instant Local Network / Free Tunnel (Testing on Mobile & Friends)

If you want to immediately test HiveTalk across devices on your WiFi or share a temporary link with anyone right now without creating cloud accounts:

### Access via Local Wi-Fi (Phone, Tablet, Laptop)
1. Make sure your PC and phone are on the same Wi-Fi.
2. Find your local IP address:
   ```powershell
   ipconfig
   ```
   (Look for `IPv4 Address`, e.g., `192.168.1.50`).
3. Start the server and client:
   ```powershell
   npm run dev:server
   # In another terminal:
   npm run dev:client -- --host
   ```
4. Open `http://<your-ip>:5173` on your phone!

### Instant Public Link via Cloudflare / LocalTunnel
```powershell
# In a new terminal, expose your server publicly:
npx cloudflared tunnel --url http://localhost:8080
```
This generates a secure public HTTPS URL (e.g. `https://random-subdomain.trycloudflare.com`) that you can share with anyone to test instantly.

---

## ⚙️ Environment Variables Reference

| Variable | Location | Description | Default |
|---|---|---|---|
| `PORT` | Server | HTTP & WebSocket server port | `8080` |
| `NODE_ENV` | Server | Set to `production` in live environments | `development` |
| `VITE_API_URL` | Client | Base HTTP REST API URL | `http://localhost:8080/api` |
| `VITE_SOCKET_URL` | Client | Base Socket.IO WebSocket URL | `http://localhost:8080` |

---

## 🛠️ Summary of Quick Commands

```powershell
# Build both frontend & backend
npm run build

# Start production server (serves client + API + sockets)
npm start

# Deploy frontend to Firebase Hosting
npm run deploy:firebase
```
