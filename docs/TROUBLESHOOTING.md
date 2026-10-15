# Troubleshooting & FAQ

Common questions, local development pitfalls, and troubleshooting steps for HiveTalk.

---

## 1. Port 8080 or Port 5173 Already in Use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::8080`

**Solution**:
1. Check which process is occupying the port:
   ```powershell
   Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
   ```
2. Terminate the blocking process or configure an alternate port in `server/src/server.ts` via `PORT=8081`.

---

## 2. Audio or Video Calling Permissions Denied

**Symptom**: `NotAllowedError: Permission dismissed or denied by user`

**Solution**:
- Ensure your browser allows microphone and camera access for `http://localhost:5173` or `http://localhost:3000`.
- In Chrome: Click the tune/padlock icon next to the address bar -> Site settings -> Allow Microphone & Camera.

---

## 3. Disappearing Messages Not Purging

**Symptom**: Messages with expiration timers remain visible.

**Solution**:
- In production, Cloud Functions scheduler runs `removeExpiredMessages` every 15 minutes.
- In local development, disappearing messages are filtered dynamically by the client when `expiresAt <= Date.now()`. To manually purge expired items from the local store, run:
  ```bash
  npx tsx scripts/cleanupData.ts
  ```

---

## 4. Resetting Local Data

**Symptom**: Corrupt local state in development.

**Solution**:
- Delete `server/data/store.json`. The server will regenerate a fresh store on restart.
- Alternatively, run the database seed script:
  ```bash
  npx tsx scripts/seedDatabase.ts
  ```
