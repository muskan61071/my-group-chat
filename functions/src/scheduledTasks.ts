import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db } from './admin.js';

export const cleanupAbandonedCalls = onSchedule('every 1 hours', async () => {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  
  const staleCalls = await db
    .collection('calls')
    .where('status', 'in', ['ringing', 'active'])
    .where('createdAt', '<=', twoHoursAgo)
    .limit(100)
    .get();

  if (!staleCalls.empty) {
    const batch = db.batch();
    staleCalls.docs.forEach((doc) => {
      batch.update(doc.ref, { status: 'ended', endedAt: Date.now() });
    });
    await batch.commit();
  }
});
