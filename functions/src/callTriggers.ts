import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db } from './admin.js';

export const onCallStatusChanged = onDocumentUpdated('calls/{callId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;

  if (before.status !== 'ended' && after.status === 'ended') {
    const duration = after.endedAt && after.startedAt ? Math.round((after.endedAt - after.startedAt) / 1000) : 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    if (after.groupId) {
      await db.collection(`groups/${after.groupId}/messages`).add({
        groupId: after.groupId,
        kind: 'system',
        text: `Call ended (${durationStr})`,
        senderId: 'system',
        senderName: 'System',
        reactions: {},
        createdAt: Date.now(),
      });
    }
  }
});
