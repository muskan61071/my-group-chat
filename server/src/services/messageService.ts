import { adminDb } from '../config/firebaseAdmin.js';
import { memMessages } from '../routes/messageRoutes.js';
import type { Message } from '../types/index.js';

export const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export interface SendMessageParams {
  groupId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string | null;
  text?: string;
  kind?: string;
  attachment?: any;
  replyTo?: any;
}

export class MessageService {
  /**
   * Persists a new message to Firestore and in-memory cache
   */
  static async createMessage(params: SendMessageParams): Promise<Message> {
    const id = 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const createdAt = Date.now();

    const msg: Message = {
      id,
      groupId: params.groupId,
      senderId: params.senderId,
      senderName: params.senderName,
      senderPhotoURL: params.senderPhoto || undefined,
      text: params.text || '',
      kind: (params.kind as any) || 'text',
      attachment: params.attachment || undefined,
      replyTo: params.replyTo || undefined,
      createdAt,
      reactions: {},
      readBy: [params.senderId],
    };

    // 1. Persist to Firestore
    try {
      await adminDb.collection(`groups/${params.groupId}/messages`).doc(id).set(msg);
      // Update group last message preview
      await adminDb.doc(`groups/${params.groupId}`).update({
        lastMessageAt: createdAt,
        lastMessagePreview: params.text || (params.attachment ? `[${params.attachment.kind || 'Attachment'}]` : 'New message'),
        updatedAt: createdAt,
      });
    } catch {}

    // 2. Cache in memory
    const list = memMessages.get(params.groupId) || [];
    list.push(msg);
    memMessages.set(params.groupId, list);

    return msg;
  }

  /**
   * Retrieves messages for a group with Firestore and in-memory fallback
   */
  static async getMessages(groupId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const snap = await adminDb
        .collection(`groups/${groupId}/messages`)
        .orderBy('createdAt', 'asc')
        .limit(limitCount)
        .get();

      if (!snap.empty) {
        return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Message));
      }
    } catch {}

    return memMessages.get(groupId) || [];
  }

  /**
   * Edits message text
   */
  static async editMessage(groupId: string, messageId: string, newText: string): Promise<boolean> {
    const updatedAt = Date.now();

    try {
      await adminDb.doc(`groups/${groupId}/messages/${messageId}`).update({
        text: newText,
        isEdited: true,
        editedAt: updatedAt,
        updatedAt,
      });
    } catch {}

    const list = memMessages.get(groupId);
    if (list) {
      const m = list.find((x) => x.id === messageId);
      if (m) {
        m.text = newText;
        m.isEdited = true;
        m.editedAt = updatedAt;
      }
    }

    return true;
  }

  /**
   * Deletes a message (for everyone or just the sender)
   */
  static async deleteMessage(groupId: string, messageId: string, forEveryone: boolean = true): Promise<boolean> {
    const deletedAt = Date.now();
    try {
      if (forEveryone) {
        await adminDb.doc(`groups/${groupId}/messages/${messageId}`).update({
          isDeleted: true,
          deletedAt,
          text: 'This message was deleted',
          attachment: null,
        });
      } else {
        await adminDb.doc(`groups/${groupId}/messages/${messageId}`).delete();
      }
    } catch {}

    const list = memMessages.get(groupId);
    if (list) {
      if (forEveryone) {
        const m = list.find((x) => x.id === messageId);
        if (m) {
          m.isDeleted = true;
          m.deletedAt = deletedAt;
          m.text = 'This message was deleted';
          m.attachment = undefined;
        }
      } else {
        memMessages.set(groupId, list.filter((x) => x.id !== messageId));
      }
    }

    return true;
  }

  /**
   * Adds or toggles an emoji reaction
   */
  static async toggleReaction(groupId: string, messageId: string, userId: string, emoji: string): Promise<Record<string, string[]>> {
    let currentReactions: Record<string, string[]> = {};

    try {
      const ref = adminDb.doc(`groups/${groupId}/messages/${messageId}`);
      const snap = await ref.get();
      if (snap.exists) {
        currentReactions = snap.data()?.reactions || {};
      }
    } catch {}

    const userList = currentReactions[emoji] || [];
    if (userList.includes(userId)) {
      currentReactions[emoji] = userList.filter((u) => u !== userId);
      if (currentReactions[emoji].length === 0) {
        delete currentReactions[emoji];
      }
    } else {
      currentReactions[emoji] = [...userList, userId];
    }

    try {
      await adminDb.doc(`groups/${groupId}/messages/${messageId}`).update({
        reactions: currentReactions,
      });
    } catch {}

    const list = memMessages.get(groupId);
    if (list) {
      const m = list.find((x) => x.id === messageId);
      if (m) m.reactions = currentReactions;
    }

    return currentReactions;
  }

  /**
   * Extracts clickable URLs from message text
   */
  static extractLinks(text: string): string[] {
    if (!text) return [];
    const matches = text.match(URL_REGEX);
    return matches ? Array.from(new Set(matches)) : [];
  }
}
