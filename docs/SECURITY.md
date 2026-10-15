# Security baseline

- The browser never receives the Firebase Admin credential or the invite pepper.
- Firestore client writes are denied. All mutations pass through Express after Firebase token verification and role checks.
- Invitation codes are random, displayed once, and stored only as peppered SHA-256 values. Rotation revokes the previous code atomically.
- Storage is limited to authenticated members, path-scoped by group, type-checked, and size-limited. Add malware scanning before exposing downloads in a public deployment.
- Use HTTPS, a managed secret store, Firebase App Check, audit logs, abuse reporting, FCM, and a TURN service in production.
- `Delete for everyone` is a tombstone, not a legal erasure guarantee; add retention/legal-hold policy as required.