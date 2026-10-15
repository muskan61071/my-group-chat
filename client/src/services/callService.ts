import { api } from '../api/apiClient';
import type { CallSession, CallType } from '../../../shared/types';
import { socketService } from './socketService';

export async function initiateCallSession(payload: {
  groupId: string;
  groupName: string;
  type: CallType;
  isGroup: boolean;
}): Promise<CallSession> {
  return api<CallSession>('/calls', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function endCallSession(callId: string, duration: number): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/calls/${callId}/end`, {
    method: 'PATCH',
    body: JSON.stringify({ duration }),
  });
}

export async function getCallHistory(): Promise<CallSession[]> {
  const res = await api<{ calls: CallSession[] }>('/calls/history');
  return res.calls;
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private bufferedCandidates: RTCIceCandidateInit[] = [];
  private onRemoteStreamCallback: ((stream: MediaStream | null) => void) | null = null;
  private targetUserId: string | null = null;
  private currentUserId: string | null = null;
  private currentGroupId: string | null = null;

  public setOnRemoteStream(cb: (stream: MediaStream | null) => void) {
    this.onRemoteStreamCallback = cb;
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  public async startLocalStream(type: CallType = 'video'): Promise<MediaStream> {
    this.stopStream();

    const constraints: MediaStreamConstraints = {
      audio: true,
      video:
        type === 'video'
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (err) {
      console.warn('[WebRTC] getUserMedia failed with video, attempting audio-only fallback:', err);
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        return this.localStream;
      } catch (audioErr) {
        console.error('[WebRTC] Microphone unavailable:', audioErr);
        // Synthesize silent audio stream as ultimate fallback so WebRTC does not break
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const dst = ctx.createMediaStreamDestination();
          osc.connect(dst);
          this.localStream = dst.stream;
          return this.localStream;
        }
        throw audioErr;
      }
    }
  }

  public initPeerConnection(currentUserId: string, targetUserId: string, groupId: string) {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.currentUserId = currentUserId;
    this.targetUserId = targetUserId;
    this.currentGroupId = groupId;
    this.bufferedCandidates = [];
    this.remoteStream = new MediaStream();

    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);
    this.peerConnection = pc;

    // Attach local stream tracks to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Emit ICE candidates via Socket.IO
    pc.onicecandidate = (event) => {
      if (event.candidate && this.targetUserId) {
        socketService.getSocket()?.emit('webrtc_signal', {
          to: this.targetUserId,
          from: this.currentUserId,
          groupId: this.currentGroupId,
          signal: {
            type: 'candidate',
            candidate: event.candidate.toJSON(),
          },
        });
      }
    };

    // Handle remote tracks and construct remoteStream
    pc.ontrack = (event) => {
      console.log('[WebRTC] ontrack received:', event.track.kind);
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      if (!this.remoteStream.getTracks().some((t) => t.id === event.track.id)) {
        this.remoteStream.addTrack(event.track);
      }
      this.onRemoteStreamCallback?.(this.remoteStream);
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] PeerConnection state:', pc.connectionState);
    };

    return pc;
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConnection.setLocalDescription(offer);

      socketService.getSocket()?.emit('webrtc_signal', {
        to: this.targetUserId,
        from: this.currentUserId,
        groupId: this.currentGroupId,
        signal: {
          type: 'offer',
          sdp: offer,
        },
      });

      return offer;
    } catch (err) {
      console.error('[WebRTC] createOffer error:', err);
      return null;
    }
  }

  public async handleSignal(payload: { from: string; signal: any; groupId: string }) {
    const { signal } = payload;
    if (!signal) return;

    if (signal.type === 'offer') {
      if (!this.peerConnection) {
        this.initPeerConnection(this.currentUserId || 'guest', payload.from, payload.groupId);
      }
      try {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        // Flush buffered candidates
        for (const cand of this.bufferedCandidates) {
          await this.peerConnection!.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
        }
        this.bufferedCandidates = [];

        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);

        socketService.getSocket()?.emit('webrtc_signal', {
          to: payload.from,
          from: this.currentUserId,
          groupId: payload.groupId,
          signal: {
            type: 'answer',
            sdp: answer,
          },
        });
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err);
      }
    } else if (signal.type === 'answer') {
      if (this.peerConnection) {
        try {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));

          for (const cand of this.bufferedCandidates) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
          }
          this.bufferedCandidates = [];
        } catch (err) {
          console.error('[WebRTC] Error handling answer:', err);
        }
      }
    } else if (signal.type === 'candidate' && signal.candidate) {
      if (this.peerConnection && this.peerConnection.remoteDescription) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(() => {});
      } else {
        this.bufferedCandidates.push(signal.candidate);
      }
    }
  }

  public async startScreenShare(): Promise<MediaStream | null> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      if (screenTrack && this.peerConnection) {
        const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      }

      return screenStream;
    } catch {
      return null;
    }
  }

  public toggleAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => (track.enabled = enabled));
  }

  public toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach((track) => (track.enabled = enabled));
  }

  public stopStream() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.bufferedCandidates = [];
    this.onRemoteStreamCallback?.(null);
  }
}

export const webrtcManager = new WebRTCManager();
