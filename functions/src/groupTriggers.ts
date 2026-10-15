import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './admin.js';

export const onMemberJoined = onDocumentCreated('groups/{groupId}/members/{userId}', async (event) => {
  const { groupId, userId } = event.params;
  const memberData = event.data?.data();
  const displayName = memberData?.displayName || memberData?.name || userId;

  // Increment group member count
  const groupRef = db.doc(`groups/${groupId}`);
  await groupRef.set({ memberCount: FieldValue.increment(1), updatedAt: Date.now() }, { merge: true });

  // Post system announcement message
  await db.collection(`groups/${groupId}/messages`).add({
    groupId,
    kind: 'system',
    text: `${displayName} joined the group`,
    senderId: 'system',
    senderName: 'System',
    reactions: {},
    createdAt: Date.now(),
  });
});

export const onMemberLeft = onDocumentDeleted('groups/{groupId}/members/{userId}', async (event) => {
  const { groupId, userId } = event.params;
  const memberData = event.data?.data();
  const displayName = memberData?.displayName || memberData?.name || userId;

  // Decrement group member count
  const groupRef = db.doc(`groups/${groupId}`);
  await groupRef.set({ memberCount: FieldValue.increment(-1), updatedAt: Date.now() }, { merge: true });

  // Post system exit message
  await db.collection(`groups/${groupId}/messages`).add({
    groupId,
    kind: 'system',
    text: `${displayName} left the group`,
    senderId: 'system',
    senderName: 'System',
    reactions: {},
    createdAt: Date.now(),
  });
});
