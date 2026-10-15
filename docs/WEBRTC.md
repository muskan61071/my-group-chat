# WebRTC Audio & Video Calling Architecture

HiveTalk supports high-fidelity 1-on-1 and group voice and video calling powered by WebRTC with Socket.IO signaling.

---

## 1. Call Lifecycle

```mermaid
sequenceDiagram
    participant A as Peer A (Initiator)
    participant S as Signaling Server
    participant B as Peer B (Receiver)

    A->>S: emit('call_initiate', { callId, groupId, type })
    S->>B: emit('incoming_call', payload)
    
    B->>S: emit('call_accept', { callId, groupId })
    S->>A: emit('call_accepted', payload)

    A->>A: createOffer() -> setLocalDescription()
    A->>S: emit('webrtc_signal', { signal: offer, to: B })
    S->>B: emit('webrtc_signal', { signal: offer, from: A })

    B->>B: setRemoteDescription() -> createAnswer()
    B->>S: emit('webrtc_signal', { signal: answer, to: A })
    S->>A: emit('webrtc_signal', { signal: answer, from: B })

    Note over A,B: Direct P2P Media Streaming Established

    A->>S: emit('call_end', { callId, duration })
    S->>B: emit('call_ended')
```

---

## 2. ICE Servers & STUN/TURN Configuration

Default STUN servers are configured in `client/src/config/appconfig.ts`:
```typescript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
]
```
For production enterprise firewalls and symmetric NATs, a TURN server (e.g. coturn or Twilio Network Traversal Service) can be provided via environment variables.

---

## 3. Supported Calling Features
- **Mute / Unmute**: Track-level enabling and disabling via `audioTrack.enabled = !audioTrack.enabled`.
- **Camera Toggle**: Front and rear cameras switching or turning off video track.
- **Screen Sharing**: `navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })`.
- **Call Duration Counter**: Real-time timer synced across participants.
