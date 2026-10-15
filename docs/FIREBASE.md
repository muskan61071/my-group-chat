# Firebase Integration Guide

HiveTalk uses Firebase for document storage (Firestore), file uploads (Firebase Storage), and background automations (Cloud Functions v2).

---

## 1. Firestore Data Collections

```
/users/{userId}
  - displayName, email, photoURL, isOnline, statusMessage, createdAt

/groups/{groupId}
  - name, description, avatarURL, category, visibility ('public' | 'private')
  - createdBy, createdAt, updatedAt, memberCount
  - lastMessage: { text, senderName, timestamp }

  /groups/{groupId}/members/{userId}
    - userId, displayName, role ('admin' | 'moderator' | 'member'), joinedAt

  /groups/{groupId}/messages/{messageId}
    - groupId, senderId, senderName, senderPhoto, text, kind ('text' | 'image' | 'video' | 'audio' | 'file' | 'system')
    - mediaUrl, mediaType, reactions, isPinned, replyToId, expiresAt, createdAt

  /groups/{groupId}/announcements/{announcementId}
    - title, content, authorId, authorName, isPinned, createdAt, commentsCount

  /groups/{groupId}/notifications/{notificationId}
    - type, title, body, createdAt, readBy[]

/invites/{inviteId}
  - code, groupId, createdBy, expiresAt, maxUses, usesCount

/calls/{callId}
  - groupId, hostId, type ('voice' | 'video'), status ('ringing' | 'active' | 'ended'), startedAt, endedAt

/payments/{paymentId}
  - senderId, recipientId, groupId, amount, currency, status, transactionRef, createdAt
```

---

## 2. Security Rules Deployment

To deploy Firestore and Storage security rules:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Storage rules
firebase deploy --only storage
```

---

## 3. Cloud Functions v2

Functions reside in `functions/src/`:
- `onMemberJoined`: Announces member joins & increments count.
- `onMemberLeft`: Announces member departures & decrements count.
- `onMessageCreated`: Updates group preview and timestamp.
- `onAnnouncementCreated`: Dispatches group notification alerts.
- `onCallStatusChanged`: Summarizes completed calls.
- `removeExpiredMessages`: Purges disappearing messages every 15 minutes.
- `cleanupAbandonedCalls`: Reclaims stale WebRTC sessions.

To deploy functions:
```bash
cd functions
npm run build
firebase deploy --only functions
```
