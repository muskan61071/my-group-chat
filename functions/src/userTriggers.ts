import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db } from './admin.js';

export const onUserProfileCreated = onDocumentCreated('users/{userId}', async (event) => {
  const snap = event.data;
  if (!snap) return;

  const data = snap.data();
  const updates: Record<string, any> = {};

  if (!data.statusMessage) {
    updates.statusMessage = 'Hey there! I am using this chat app ✨';
  }
  if (!data.createdAt) {
    updates.createdAt = Date.now();
  }
  if (data.isOnline === undefined) {
    updates.isOnline = false;
  }

  if (Object.keys(updates).length > 0) {
    await snap.ref.set(updates, { merge: true });
  }
});
