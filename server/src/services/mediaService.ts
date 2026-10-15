import fs from 'fs';
import path from 'path';
import { adminDb, adminStorage } from '../config/firebaseAdmin.js';
import { memMessages } from '../routes/messageRoutes.js';
import { URL_REGEX } from './messageService.js';

export interface MediaAttachment {
  url: string;
  name: string;
  size: number;
  mimeType: string;
  kind: 'image' | 'video' | 'audio' | 'file';
  messageId?: string;
  createdAt?: number;
}

export class MediaService {
  /**
   * Determines attachment category based on MIME type or extension
   */
  static categorizeMimeType(mime: string, filename: string): 'image' | 'video' | 'audio' | 'file' {
    const m = (mime || '').toLowerCase();
    const ext = path.extname(filename || '').toLowerCase();

    if (m.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
      return 'image';
    }
    if (m.startsWith('video/') || ['.mp4', '.webm', '.mov', '.m4v', '.avi'].includes(ext)) {
      return 'video';
    }
    if (m.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a', '.webm', '.aac'].includes(ext)) {
      return 'audio';
    }
    return 'file';
  }

  /**
   * Uploads a file to Firebase Storage with local disk fallback
   */
  static async uploadFile(file: Express.Multer.File, groupId: string): Promise<MediaAttachment> {
    const kind = this.categorizeMimeType(file.mimetype, file.originalname);
    let publicUrl = '';

    // 1. Try Firebase Storage
    try {
      const bucket = adminStorage.bucket();
      const dest = `groups/${groupId}/${Date.now()}_${path.basename(file.originalname)}`;
      await bucket.upload(file.path, {
        destination: dest,
        metadata: {
          contentType: file.mimetype,
        },
      });

      const [signedUrl] = await bucket.file(dest).getSignedUrl({
        action: 'read',
        expires: '2099-12-31',
      });
      publicUrl = signedUrl;
    } catch {
      // 2. Local fallback
      const relPath = `/uploads/${path.basename(file.path)}`;
      publicUrl = relPath;
    }

    return {
      url: publicUrl,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      kind,
    };
  }

  /**
   * Retrieves categorized media assets and links for a group
   */
  static async getCategorizedMedia(groupId: string) {
    const images: any[] = [];
    const videos: any[] = [];
    const documents: any[] = [];
    const audio: any[] = [];
    const links: any[] = [];

    // 1. Check Firestore messages
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

        return { images, videos, documents, audio, links };
      }
    } catch {}

    // 2. In-memory messages fallback
    const list = memMessages.get(groupId) || [];
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

    return { images, videos, documents, audio, links };
  }
}
