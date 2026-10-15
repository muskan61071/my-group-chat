# Media & Storage Architecture

HiveTalk manages file sharing, voice messages, group banners, and user profile pictures with dual storage support.

---

## 1. Storage Drivers

### Local Storage Driver (Default / Development)
- Upload directory: `server/uploads/`
- Static serving: `GET /uploads/:filename`
- Size limit: 25 MB per attachment
- Supported formats: JPEG, PNG, WebP, GIF, MP4, WebM, MP3, WAV, PDF, DOCX, ZIP

### Firebase Cloud Storage Driver (Production)
- Bucket paths:
  - User Avatars: `/avatars/{userId}/{filename}`
  - Group Attachments: `/groups/{groupId}/{filename}`
- Direct streaming with signed URLs or public download tokens.
- Protected by `firebase/storage.rules`.

---

## 2. Voice Messaging

- Audio is captured in the browser via `MediaRecorder` using the `audio/webm;codecs=opus` format.
- Audio chunks are merged and converted to a `Blob`, then submitted to `POST /api/media/upload`.
- The waveform preview and playback duration are calculated on the client.

---

## 3. Image Optimization

Before upload, images can be resized and converted to progressive WebP or compressed JPEG on the client to minimize bandwidth and accelerate mobile delivery.
