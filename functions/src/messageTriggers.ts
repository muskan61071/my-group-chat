import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db } from './admin.js';

export const onMessageCreated = onDocumentCreated('groups/{groupId}/messages/{messageId}', async (event) => {
  const { groupId, messageId } = event.params;
  const msg = event.data?.data();
  if (!msg) return;

  const preview = msg.kind === 'image' ? '📷 Photo'
    : msg.kind === 'video' ? '📹 Video'
    : msg.kind === 'audio' ? '🎵 Audio note'
    : msg.kind === 'file' ? '📎 Attachment'
    : (msg.text ? (msg.text.length > 60 ? msg.text.substring(0, 57) + '...' : msg.text) : 'New message');

  await db.doc(`groups/${groupId}`).set({
    lastMessage: {
      id: messageId,
      text: preview,
      senderId: msg.senderId,
      senderName: msg.senderName || 'Member',
      timestamp: msg.createdAt || Date.now(),
    },
    updatedAt: Date.now(),
  }, { merge: true });
});
