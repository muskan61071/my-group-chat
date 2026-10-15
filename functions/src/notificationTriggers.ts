import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db } from './admin.js';

export const onAnnouncementCreated = onDocumentCreated('groups/{groupId}/announcements/{announcementId}', async (event) => {
  const { groupId, announcementId } = event.params;
  const ann = event.data?.data();
  if (!ann) return;

  await db.collection(`groups/${groupId}/notifications`).add({
    groupId,
    type: 'announcement',
    title: 'New Announcement',
    body: ann.title || 'A new announcement has been posted.',
    announcementId,
    createdAt: Date.now(),
    readBy: [],
  });
});
