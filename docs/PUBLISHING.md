# Publishing, Custom Branding & Deployment Guide

This comprehensive guide explains how to customize your app name & icon, invite people to groups, install the app on mobile & desktop (PWA), and publish your application to the internet so anyone worldwide can use it in real time.

---

## 1. Custom Branding: Setting Your Own App Name & Logo

The application includes dynamic white-label customization. Anyone hosting or installing the app can customize it to their exact preference:

### How to Change the App Name & Icon:
1. Open the application.
2. In the left sidebar header (or on initial launch), click the **App Icon / Name badge** or go to **Settings** (⚙️ gear icon) -> **App Customization & Branding**.
3. In the Branding modal:
   - **App Name**: Enter any custom name you want (e.g., *My Team Chat*, *Family Connect*, *Crypto Circle*, *Campus Talk*).
   - **App Icon / Logo**:
     - **Upload Custom Logo**: Upload any PNG, JPG, or SVG from your device.
     - **Preset Vector Badges**: Choose from clean, modern presets (Chat bubbles, Community shield, Lightning bolt, Sparkles, Orbit, etc.).
   - **Theme**: Select your preferred accent theme (Modern White/Teal, Dark Slate, Emerald Green, Indigo Purple, Warm Mocha, Crimson).
4. Click **"Save Branding"**.
5. **Real-Time Synchronized**: The custom branding is saved in the server's database (`localStore`) and broadcast in real-time over WebSockets (`system_branding_updated`) to all connected users, mobile devices, and browser tabs.

---

## 2. Managing & Joining Groups

There are **zero hardcoded dummy groups**. The chat list starts clean with whatever groups you and your members create.

### Creating a Group:
1. Click the **"New Group"** (+ button) in the sidebar.
2. Enter your group details:
   - **Group Name**: Name it whatever you wish (e.g., *Engineering Standup*, *Family Weekend*, *Study Group*).
   - **Description**: Add group purpose or topics.
   - **Visibility**: Choose `Public` (discoverable) or `Private` (invite-only).
   - **Avatar / Icon**: Pick a color gradient or upload a custom image.
3. Click **"Create Group"**. The group is created instantly and synchronized across all active users in real-time via WebSockets.

### Inviting Members to Join:
Your app provides 4 easy ways to invite members:
1. **Direct Invite Link**:
   - In any group chat header, click the **QR Code** or **Invite** icon.
   - Click **"Copy Link"** (e.g., `https://your-domain.com/join?code=XYZ`).
   - Anyone who clicks this link will be taken straight to your group.
2. **WhatsApp Sharing**:
   - Click **"Send via WhatsApp"**. It opens WhatsApp with a pre-formatted message:
     *"Join our group '[Your Group Name]' on [Your App Name]! Link: https://your-domain.com/join?code=XYZ"*.
3. **6-Digit Invite Code**:
   - Members can click **"Join Group"** in the sidebar, type the code (e.g., `XYZ`), and tap **"Join Conversation"**.
4. **QR Code Scanner**:
   - Members can scan the group's QR code using their camera or upload a QR image.

---

## 3. How Users "Install" the App on Phone & Desktop (PWA)

The app is a Progressive Web App (PWA). When users set their custom App Name and Icon, the app automatically generates a dynamic Web App Manifest and favicon matching their choice!

### On Mobile Phones (Android & iOS):
1. Open your deployed chat app URL in Chrome (Android) or Safari (iPhone/iPad).
2. **Android**:
   - Tap the three-dot browser menu `⋮` and select **"Add to Home screen"** or **"Install app"**.
   - The app will install with your **custom app name and icon**.
3. **iPhone (iOS Safari)**:
   - Tap the **Share** button (box with upward arrow) at the bottom.
   - Scroll down and tap **"Add to Home Screen"**.
   - Tap **"Add"**. The app appears on the home screen as a native full-screen app!

### On Desktop (Windows, Mac, Linux):
1. Open Chrome, Edge, or Brave.
2. In the address bar on the right, click the **Install icon (computer with down arrow)**.
3. Click **"Install"**. The app opens in its own window without browser tabs or URL bars.

---

## 4. How to Publish & Deploy (Make it Live Online)

Because the Express backend server compiles and serves Socket.IO WebSockets, the REST API, uploaded media, and the React frontend on a **single unified port (8080 or process.env.PORT)**, you only need to deploy **one** single service!

### Option A: Deploy Free on Render (Easiest & Fastest)
1. Push your repository to your GitHub account:
   ```bash
   git add .
   git commit -m "Deploy white-label chat app"
   git push origin main
   ```
2. Go to [render.com](https://render.com) and create a free account.
3. On your dashboard, click **"New +"** -> **"Web Service"**.
4. Select **"Build and deploy from a Git repository"** and connect your GitHub repository.
5. Fill in the following fields:
   - **Name**: `my-group-chat` (or your chosen service name)
   - **Language / Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `INVITE_CODE_PEPPER` = *(Any random 32-character string, e.g., `my-super-secret-pepper-key-2026!`)*
7. Click **"Deploy Web Service"**.
8. In 2–3 minutes, Render will provide a live HTTPS URL (e.g., `https://my-group-chat.onrender.com`).
9. Visit this URL on any phone or computer — your app is live in real-time!

---

### Option B: Deploy Free on Railway
1. Sign in to [railway.app](https://railway.app) using GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select this repository. Railway will detect Node.js automatically.
4. Under project **Settings**:
   - In **Build Command**, verify: `npm install && npm run build`
   - In **Start Command**, verify: `npm start`
   - Under **Networking**, click **"Generate Domain"** to get a public `https://...up.railway.app` URL.
5. In **Variables**, add:
   - `NODE_ENV` = `production`
   - `INVITE_CODE_PEPPER` = `my-super-secret-pepper-key-2026!`

---

### Option C: Deploy with Docker on Any Cloud VPS (AWS, DigitalOcean, Hetzner, Linode)
This repository includes a production multi-stage `Dockerfile`:

1. Copy the code to your server or VPS.
2. Build the Docker container:
   ```bash
   docker build -t custom-chat-app .
   ```
3. Run the container:
   ```bash
   docker run -d -p 8080:8080 \
     --name chat-app \
     --restart unless-stopped \
     -v $(pwd)/data:/app/data \
     -v $(pwd)/uploads:/app/uploads \
     -e NODE_ENV=production \
     -e PORT=8080 \
     -e INVITE_CODE_PEPPER="your-secret-pepper-key" \
     custom-chat-app
   ```
4. Point your domain (e.g. `chat.yourdomain.com`) with Nginx or Caddy with SSL (Let's Encrypt).

---

## 5. Testing Locally Before Deploying

You can run the full production unified build on your local machine anytime:

```bash
# 1. Build client and server bundles
npm run build

# 2. Launch production server
npm start
```
Open `http://localhost:8080` in your web browser. You can open two different browsers (e.g. Chrome and Firefox or an incognito window), create a group, join with the invite code or link, and test real-time chat, typing indicators, reactions, and calls!
