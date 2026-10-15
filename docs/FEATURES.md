# Feature implementation map

The supplied structure is intentionally organized by domain. Add a vertical slice for each advanced capability: UI component/page, client service, Express route/service/validator, Firestore rule impact, Cloud Function trigger, and tests.

| Capability | Recommended implementation |
| --- | --- |
| Calls and screen share | WebRTC + authenticated Socket.IO signalling + TURN (coturn/Twilio); persist only call events |
| Voice notes/camera | `MediaRecorder` / `getUserMedia`, upload to Storage, create a normal `audio`/`video` message |
| Announcements/comments | `groups/{id}/announcements` and nested comments; admin/moderator Express mutations |
| Search | Cloud Function indexing into Algolia, Typesense, or Meilisearch; authorize group filter server-side |
| Notifications | Firestore trigger → FCM per user, notification collection for in-app inbox |
| Disappearing messages | Set `expiresAt` at write; scheduled Function deletes data and associated Storage object |
| Payments | Stripe Checkout/Payment Intents plus webhook verification; attach only provider IDs/status |
| Read receipts/presence | Member `lastReadAt` and Realtime Database presence mirrored into Firestore |