# Firestore layout

| Path | Owner | Purpose |
| --- | --- | --- |
| `users/{uid}` | Server / profile owner | Public profile and presence metadata |
| `groups/{groupId}` | Server | Group metadata, `memberIds`, active invite reference |
| `groups/{groupId}/members/{uid}` | Server | Role, join/read/mute state |
| `groups/{groupId}/messages/{messageId}` | Server | Messages, reply reference, reactions, expiry state |
| `groups/{groupId}/announcements/{id}` | Server | Announcement body, attachments, comments/reactions |
| `invites/{inviteId}` | Server only | Hashed code, lifecycle, group target |
| `calls/{callId}` | Server only | Signalling audit and call history—do not store media |
| `payments/{paymentId}` | Server/provider webhook | Provider references only; never payment credentials |
| `notifications/{id}` | Server/function | Per-recipient notification payloads |

Use cursor pagination (`orderBy(createdAt)`, `startAfter`) for messages and denormalize only values necessary to render a list. Do not make `memberIds` unbounded: move large-group membership discovery to a dedicated search index once the group size approaches Firestore document limits.