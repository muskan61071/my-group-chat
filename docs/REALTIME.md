# Real-Time Socket.IO Protocol Specification

HiveTalk uses Socket.IO on port 8080 (or unified server in production) for low-latency messaging, typing indicators, presence, and WebRTC signaling.

---

## 1. Connection & Authentication

### `authenticate` (Client -> Server)
Sent immediately upon socket connection.
- **Payload**:
  ```json
  {
    "userId": "usr_abc123",
    "displayName": "Alex Johnson",
    "photoURL": null
  }
  ```
- **Action**: Registers socket ID with user identity and joins `user:<userId>` room for targeted alerts.

### `presence_update` (Server -> Client Broadcast)
Emitted to all clients when a user goes online or disconnects.
- **Payload**: `{ "userId": "...", "isOnline": true, "lastSeen": 1720000000000 }`

---

## 2. Group Room Management

### `join_group` (Client -> Server)
- **Payload**: `{ "groupId": "grp_xyz", "userId": "usr_abc123" }`
- **Response**: Socket joins `group:<groupId>` room and receives `group_presence` event with currently active members.

### `leave_group` (Client -> Server)
- **Payload**: `{ "groupId": "grp_xyz", "userId": "usr_abc123" }`

---

## 3. Messaging Events

| Event Name | Direction | Payload Description |
| :--- | :--- | :--- |
| `send_message` | Client -> Server | Message object |
| `new_message` | Server -> Group | Broadcasts created message to group room |
| `edit_message` | Client -> Server | `{ groupId, messageId, text }` |
| `message_edited` | Server -> Group | Broadcasts updated message |
| `delete_message` | Client -> Server | `{ groupId, messageId }` |
| `message_deleted` | Server -> Group | Broadcasts deleted message ID |
| `react_message` | Client -> Server | `{ groupId, messageId, emoji, userId }` |
| `message_reacted` | Server -> Group | Broadcasts updated reaction counters |
| `pin_message` | Client -> Server | `{ groupId, messageId, isPinned }` |
| `message_pinned` | Server -> Group | Broadcasts pinned message update |

---

## 4. Typing Indicators

- **Start Typing**: Client emits `typing_start` `{ groupId, userId, userName }` -> server broadcasts `user_typing` to group room (excluding sender).
- **Stop Typing**: Client emits `typing_stop` `{ groupId, userId }` -> server broadcasts `user_stopped_typing` to group room.

---

## 5. WebRTC Call Signaling

- `call_initiate`: Sent by caller `{ callId, groupId, type: 'voice'|'video', initiator }` -> broadcasts `incoming_call`.
- `call_accept`: Sent by recipient `{ callId, groupId, user }` -> broadcasts `call_accepted`.
- `call_reject`: Sent by recipient `{ callId, groupId, user }` -> emits `call_rejected`.
- `call_end`: Sent by any participant `{ callId, groupId, duration }` -> broadcasts `call_ended`.
- `webrtc_signal`: Relays SDP offers, answers, and ICE candidates between peers.
