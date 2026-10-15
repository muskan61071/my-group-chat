import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/authMiddleware.js';
import { adminDb, adminStorage, isFirebaseInitialized } from '../config/firebaseAdmin.js';
import { localStore } from '../config/localStore.js';
import { memMessages } from './messageRoutes.js';

const r = Router({ mergeParams: true });

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

// POST /api/groups/:groupId/media/upload
r.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw Object.assign(new Error('No file provided'), { status: 400 });
    }

    const { groupId } = req.params;
    let mediaKind: 'image' | 'video' | 'audio' | 'document' = 'document';
    const ext = path.extname(file.originalname).toLowerCase();
    let detectedMime = file.mimetype;

    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif', '.jfif', '.ico'];
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.mkv'];
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm', '.flac'];

    if (file.mimetype.startsWith('image/') || imageExts.includes(ext)) {
      mediaKind = 'image';
      if (!detectedMime || detectedMime === 'application/octet-stream') {
        detectedMime =
          ext === '.png'
            ? 'image/png'
            : ext === '.gif'
            ? 'image/gif'
            : ext === '.webp'
            ? 'image/webp'
            : ext === '.svg'
            ? 'image/svg+xml'
            : 'image/jpeg';
      }
    } else if (file.mimetype.startsWith('video/') || videoExts.includes(ext)) {
      mediaKind = 'video';
    } else if (file.mimetype.startsWith('audio/') || audioExts.includes(ext)) {
      mediaKind = 'audio';
    }

    let fileUrl = `/uploads/${file.filename}`;

    // Upload to Firebase Storage bucket if configured
    try {
      if (process.env.FIREBASE_STORAGE_BUCKET) {
        const bucket = adminStorage.bucket();
        const destination = `groups/${groupId}/${Date.now()}-${file.originalname}`;
        await bucket.upload(file.path, {
          destination,
          metadata: {
            contentType: detectedMime,
            metadata: {
              groupId,
              originalName: file.originalname,
            },
          },
        });
        const [signedUrl] = await bucket.file(destination).getSignedUrl({
          action: 'read',
          expires: '03-01-2035',
        });
        if (signedUrl) {
          fileUrl = signedUrl;
        }
      }
    } catch (storageErr) {
      console.warn('[Storage] Firebase Storage upload skipped or failed, using local file URL:', storageErr);
    }

    const attachment = {
      url: fileUrl,
      name: file.originalname,
      size: file.size,
      kind: mediaKind,
      mimeType: detectedMime,
      groupId,
      createdAt: Date.now(),
    };

    res.status(201).json(attachment);
  } catch (e) {
    next(e);
  }
});

// GET /api/groups/:groupId/media - Categorized media retrieval
r.get('/', requireAuth, async (req, res, next) => {
  try {
    const groupId = String(req.params.groupId);

    const images: any[] = [];
    const videos: any[] = [];
    const documents: any[] = [];
    const audio: any[] = [];
    const links: any[] = [];

    // 1. Try fetching from Firestore if initialized
    if (isFirebaseInitialized) {
      try {
        const snap = await adminDb
          .collection(`groups/${groupId}/messages`)
          .orderBy('createdAt', 'desc')
          .limit(200)
          .get();

        if (!snap.empty) {
          snap.docs.forEach((d) => {
            const data = d.data();
            const att = data.attachment;
            if (att) {
              if (att.kind === 'image') images.push({ ...att, messageId: d.id, createdAt: data.createdAt });
              else if (att.kind === 'video') videos.push({ ...att, messageId: d.id, createdAt: data.createdAt });
              else if (att.kind === 'audio') audio.push({ ...att, messageId: d.id, createdAt: data.createdAt });
              else documents.push({ ...att, messageId: d.id, createdAt: data.createdAt });
            }

            // Extract URLs from message text
            if (typeof data.text === 'string') {
              const matches = data.text.match(URL_REGEX);
              if (matches) {
                matches.forEach((u: string) => {
                  links.push({
                    url: u,
                    text: data.text,
                    senderName: data.senderName || 'Member',
                    createdAt: data.createdAt,
                    messageId: d.id,
                  });
                });
              }
            }
          });

          return res.json({ images, videos, documents, audio, links });
        }
      } catch {}
    }

    // 2. Fallback to localStore / in-memory messages store
    const list = localStore.getMessages(groupId).length > 0 ? localStore.getMessages(groupId) : (memMessages.get(groupId) || []);
    list.forEach((m) => {
      const att = m.attachment;
      if (att) {
        if (att.kind === 'image') images.push({ ...att, messageId: m.id, createdAt: m.createdAt });
        else if (att.kind === 'video') videos.push({ ...att, messageId: m.id, createdAt: m.createdAt });
        else if (att.kind === 'audio') audio.push({ ...att, messageId: m.id, createdAt: m.createdAt });
        else documents.push({ ...att, messageId: m.id, createdAt: m.createdAt });
      }

      if (typeof m.text === 'string') {
        const matches = m.text.match(URL_REGEX);
        if (matches) {
          matches.forEach((u: string) => {
            links.push({
              url: u,
              text: m.text,
              senderName: m.senderName || 'Member',
              createdAt: m.createdAt,
              messageId: m.id,
            });
          });
        }
      }
    });

    return res.json({ images, videos, documents, audio, links });
  } catch (e) {
    next(e);
  }
});

export default r;
