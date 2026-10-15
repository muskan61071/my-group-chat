export type CallType = 'voice' | 'video';
export type CallStatus = 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'busy';

export interface CallParticipant {
  userId: string;
  displayName: string;
  photoURL?: string | null;
  joinedAt?: number;
  leftAt?: number;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
}

export interface CallSession {
  id: string;
  groupId: string;
  groupName?: string;
  initiatorId: string;
  initiatorName: string;
  initiatorPhotoURL?: string | null;
  type: CallType;
  isGroup: boolean;
  status: CallStatus;
  participants: Record<string, CallParticipant>;
  startedAt: number;
  connectedAt?: number;
  endedAt?: number;
  duration?: number; // in seconds
}

export interface WebRTCSignalData {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: any;
  candidate?: any;
  from: string;
  to?: string;
  callId: string;
}
