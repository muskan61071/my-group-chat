import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db } from './admin.js';

export const removeExpiredMessages = onSchedule('every 15 minutes', async () => {
  const now = Date.now();
  const groupsSnap = await db.collection('groups').get();
  
  for (const groupDoc of groupsSnap.docs) {
    const expiredSnap = await groupDoc.ref
      .collection('messages')
      .where('expiresAt', '<=', now)
      .limit(400)
      .get();

    if (!expiredSnap.empty) {
      const batch = db.batch();
      expiredSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
});
