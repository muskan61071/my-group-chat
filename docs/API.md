# HiveTalk REST API Reference

The HiveTalk server provides a RESTful API listening on `http://localhost:8080/api`.

---

## Authentication Header
All authenticated endpoints require an Authorization bearer token:
```http
Authorization: Bearer <TOKEN>
```
Tokens can be:
- A Firebase ID Token (`eyJ...`)
- A Local Mock Token (`mock_<base64>`)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Registers a new local or cloud user.
- **Body**: `{ "email": "user@example.com", "password": "...", "displayName": "Alex" }`
- **Response**: `{ "user": { "uid": "...", "email": "...", "displayName": "Alex" }, "token": "..." }`

### `POST /api/auth/login`
Authenticates an existing user.
- **Body**: `{ "email": "user@example.com", "password": "..." }`
- **Response**: User object and access token.

### `POST /api/auth/guest`
Creates a fast guest session for immediate participation.
- **Body**: `{ "displayName": "Alex" }`
- **Response**: Guest user object and bearer token.

---

## 2. Groups Endpoints

### `GET /api/groups`
Returns all groups the authenticated user is a member of, plus public groups.

### `POST /api/groups`
Creates a new group.
- **Body**:
  ```json
  {
    "name": "Frontend Guild",
    "description": "Discussions on UI/UX and React",
    "visibility": "private",
    "category": "Technology"
  }
  ```
- **Response**: Created group object with auto-generated `inviteCode`.

### `GET /api/groups/:groupId`
Returns detailed group metadata and member count.

### `PATCH /api/groups/:groupId`
Updates group metadata (requires `admin` or `moderator` role).

### `DELETE /api/groups/:groupId`
Permanently deletes group (requires `admin` role).

### `POST /api/groups/join`
Joins a group using an invite code.
- **Body**: `{ "code": "ABC12345" }`

### `GET /api/groups/:groupId/members`
Returns the list of members and their roles (`admin`, `moderator`, `member`).

### `PATCH /api/groups/:groupId/members/:userId`
Updates member role (requires `admin`).
- **Body**: `{ "role": "moderator" }`

### `DELETE /api/groups/:groupId/members/:userId`
Removes a member from the group (admin kick or self-leave).

---

## 3. Messages Endpoints

### `GET /api/messages/:groupId`
Retrieves paginated chat history for a group.
- **Query**: `?limit=50&before=<timestamp>`

### `POST /api/messages/:groupId`
Sends a message to the group.
- **Body**:
  ```json
  {
    "text": "Hello team!",
    "kind": "text",
    "replyToId": "msg_123"
  }
  ```

### `PATCH /api/messages/:groupId/:messageId`
Edits message text (sender only).

### `DELETE /api/messages/:groupId/:messageId`
Deletes or soft-deletes a message (sender, moderator, or admin).

### `POST /api/messages/:groupId/:messageId/reactions`
Toggles an emoji reaction on a message.
- **Body**: `{ "emoji": "👍" }`

### `PATCH /api/messages/:groupId/:messageId/pin`
Pins or unpins a message (moderator or admin).

---

## 4. Announcements Endpoints

### `GET /api/announcements/:groupId`
Fetches announcements for a group.

### `POST /api/announcements/:groupId`
Posts a new group announcement (moderator or admin).
- **Body**: `{ "title": "Release v1.2 Scheduled", "content": "Deployment tomorrow at 10:00 UTC." }`

---

## 5. Media & Uploads Endpoints

### `POST /api/media/upload`
Uploads files or voice notes.
- **Form Data**: `file` (multipart/form-data)
- **Response**: `{ "url": "/uploads/...", "fileName": "audio.webm", "fileSize": 12890 }`

---

## 6. Payments Endpoints

### `POST /api/payments/create`
Initiates a peer-to-peer or group payment.
- **Body**: `{ "amount": 25.00, "currency": "USD", "recipientId": "user_456", "note": "Lunch split" }`

### `GET /api/payments/status/:paymentId`
Checks payment status and verification.

### `GET /api/payments/my`
Returns payment history for the authenticated user.
