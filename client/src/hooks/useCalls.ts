import { useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import { webrtcManager, initiateCallSession, endCallSession } from '../services/callService';
import type { CallSession, CallType } from '../../../shared/types';

export function useCalls(currentUser?: { uid: string; displayName?: string; photoURL?: string | null } | null) {
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Listen to remote tracks from WebRTC manager
    webrtcManager.setOnRemoteStream((stream) => {
      setRemoteStream(stream ? new MediaStream(stream.getTracks()) : null);
    });

    const socket = socketService.getSocket();

    const handleIncomingCall = (payload: any) => {
      const initiatorId = payload.initiator?.userId || payload.initiatorId;
      if (initiatorId !== currentUser?.uid && !activeCall) {
        setIncomingCall(payload);
      }
    };

    const handleCallAccepted = async (payload: any) => {
      console.log('[WebRTC] Call accepted by peer:', payload);
      const acceptorId = payload.user?.uid || payload.user?.userId;
      if (acceptorId && acceptorId !== currentUser?.uid && activeCall) {
        webrtcManager.initPeerConnection(currentUser?.uid || 'caller', acceptorId, payload.groupId);
        await webrtcManager.createOffer();
      }
    };

    const handleCallRejected = () => {
      endCallCleanup();
    };

    const handleCallEnded = () => {
      endCallCleanup();
    };

    const handleWebRTCSignal = async (payload: any) => {
      if (payload.from !== currentUser?.uid) {
        await webrtcManager.handleSignal(payload);
      }
    };

    socket?.on('incoming_call', handleIncomingCall);
    socket?.on('call_accepted', handleCallAccepted);
    socket?.on('call_rejected', handleCallRejected);
    socket?.on('call_ended', handleCallEnded);
    socket?.on('webrtc_signal', handleWebRTCSignal);

    return () => {
      socket?.off('incoming_call', handleIncomingCall);
      socket?.off('call_accepted', handleCallAccepted);
      socket?.off('call_rejected', handleCallRejected);
      socket?.off('call_ended', handleCallEnded);
      socket?.off('webrtc_signal', handleWebRTCSignal);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [currentUser?.uid, activeCall]);

  const startCall = async (groupId: string, groupName: string, type: CallType = 'video') => {
    try {
      const session = await initiateCallSession({
        groupId,
        groupName,
        type,
        isGroup: true,
      });

      const stream = await webrtcManager.startLocalStream(type);
      setLocalStream(stream);

      setActiveCall(session);
      setIsMuted(false);
      setIsVideoOff(type === 'voice');
      setCallDuration(0);

      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      socketService.getSocket()?.emit('call_initiate', {
        callId: session.id,
        groupId,
        groupName,
        type,
        initiator: {
          userId: currentUser?.uid,
          displayName: currentUser?.displayName || 'Caller',
          photoURL: currentUser?.photoURL,
        },
      });

      return session;
    } catch (err) {
      console.warn('Backend call initiation fallback to local session:', err);
      const fallback: CallSession = {
        id: 'call_' + Date.now(),
        groupId,
        groupName,
        initiatorId: currentUser?.uid || 'user',
        initiatorName: currentUser?.displayName || 'User',
        type,
        isGroup: true,
        status: 'connected',
        participants: {},
        startedAt: Date.now(),
      };
      const stream = await webrtcManager.startLocalStream(type);
      setLocalStream(stream);
      setActiveCall(fallback);
      setIsMuted(false);
      setIsVideoOff(type === 'voice');
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      socketService.getSocket()?.emit('call_initiate', {
        callId: fallback.id,
        groupId,
        groupName,
        type,
        initiator: {
          userId: currentUser?.uid,
          displayName: currentUser?.displayName || 'Caller',
          photoURL: currentUser?.photoURL,
        },
      });

      return fallback;
    }
  };

  const acceptCall = async (session: CallSession) => {
    setIncomingCall(null);
    setActiveCall(session);

    try {
      const stream = await webrtcManager.startLocalStream(session.type);
      setLocalStream(stream);
      setIsMuted(false);
      setIsVideoOff(session.type === 'voice');

      const initiatorId = (session as any).initiator?.userId || session.initiatorId;
      webrtcManager.initPeerConnection(currentUser?.uid || 'guest', initiatorId, session.groupId);

      socketService.getSocket()?.emit('call_accept', {
        callId: session.id,
        groupId: session.groupId,
        user: currentUser,
      });

      setCallDuration(0);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('[WebRTC] acceptCall failed:', err);
    }
  };

  const rejectCall = (session: CallSession) => {
    setIncomingCall(null);
    socketService.getSocket()?.emit('call_reject', {
      callId: session.id,
      groupId: session.groupId,
      user: currentUser,
    });
  };

  const endCallCleanup = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    webrtcManager.stopStream();
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
    setIsScreenSharing(false);
    setCallDuration(0);
  };

  const endCall = async () => {
    if (activeCall) {
      socketService.getSocket()?.emit('call_end', {
        callId: activeCall.id,
        groupId: activeCall.groupId,
        user: currentUser,
        duration: callDuration,
      });
      await endCallSession(activeCall.id, callDuration).catch(() => {});
    }
    endCallCleanup();
  };

  const toggleMic = () => {
    const next = !isMuted;
    setIsMuted(next);
    webrtcManager.toggleAudio(!next);
  };

  const toggleCam = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    webrtcManager.toggleVideo(!next);
  };

  const toggleScreen = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      const stream = await webrtcManager.startLocalStream(activeCall?.type || 'voice');
      setLocalStream(stream);
    } else {
      const stream = await webrtcManager.startScreenShare();
      if (stream) {
        setIsScreenSharing(true);
        setLocalStream(stream);
      }
    }
  };

  return {
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isScreenSharing,
    callDuration,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCam,
    toggleScreen,
  };
}
