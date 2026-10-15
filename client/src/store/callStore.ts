import { useState, useEffect } from 'react';
import type { CallSession, CallType } from '../../../shared/types/index.js';

interface CallState {
  activeCall: CallSession | null;
  incomingCall: any | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
}

let globalCallState: CallState = {
  activeCall: null,
  incomingCall: null,
  isMuted: false,
  isVideoOff: false,
  callDuration: 0,
};

const listeners = new Set<(state: CallState) => void>();

function notify() {
  listeners.forEach((l) => l(globalCallState));
}

export function useCallStore() {
  const [state, setState] = useState<CallState>(globalCallState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setActiveCall = (activeCall: CallSession | null) => {
    globalCallState = { ...globalCallState, activeCall };
    notify();
  };

  const setIncomingCall = (incomingCall: any | null) => {
    globalCallState = { ...globalCallState, incomingCall };
    notify();
  };

  const toggleMute = () => {
    globalCallState = { ...globalCallState, isMuted: !globalCallState.isMuted };
    notify();
  };

  const toggleVideo = () => {
    globalCallState = { ...globalCallState, isVideoOff: !globalCallState.isVideoOff };
    notify();
  };

  const setDuration = (callDuration: number) => {
    globalCallState = { ...globalCallState, callDuration };
    notify();
  };

  return {
    ...state,
    setActiveCall,
    setIncomingCall,
    toggleMute,
    toggleVideo,
    setDuration,
  };
}

export const callStore = {
  getState: () => globalCallState,
  setIncomingCall: (call: any | null) => {
    globalCallState = { ...globalCallState, incomingCall: call };
    notify();
  },
};
