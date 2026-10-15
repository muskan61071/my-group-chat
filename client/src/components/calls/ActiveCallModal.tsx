import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Maximize,
  Minimize,
  RefreshCw,
  Signal,
  Volume2,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import type { CallSession } from '../../../../shared/types';

interface ActiveCallModalProps {
  session: CallSession;
  callDuration: number;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreen: () => void;
  onEndCall: () => void;
}

export function ActiveCallModal({
  session,
  callDuration,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMic,
  onToggleCam,
  onToggleScreen,
  onEndCall,
}: ActiveCallModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const hasRemoteVideo = Boolean(
    remoteStream && remoteStream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live')
  );

  // Attach remote stream to remote video and audio elements
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream, hasRemoteVideo]);

  // Attach local stream to local PiP video
  useEffect(() => {
    if (localVideoRef.current && localStream && !isVideoOff) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isVideoOff]);

  const formatDuration = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0A0E11',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isFullscreen ? '1rem' : '1.5rem',
        boxSizing: 'border-box',
      }}
      className="animate-fade-in"
    >
      {/* Hidden audio element for remote participant audio */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Top Header Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
          zIndex: 10,
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', margin: 0 }}>
            {session.groupName || 'Group Video Call'}
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#D8C2B5',
              fontSize: '0.85rem',
              marginTop: '3px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
              }}
            />
            <span>Connected · {formatDuration(callDuration)}</span>
            <span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Signal size={13} style={{ color: '#10B981' }} /> HD Real-Time
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-icon"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: 'white' }}
            onClick={() => setIsMirrored((m) => !m)}
            title="Mirror Camera"
          >
            <RefreshCw size={18} />
          </button>
          <button
            type="button"
            className="btn-icon"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', color: 'white' }}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Center Main Viewport */}
      <div
        style={{
          width: 'min(96vw, 860px)',
          height: isFullscreen ? 'calc(100vh - 160px)' : 'min(62vh, 540px)',
          backgroundColor: '#111B21',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 1. REMOTE PARTICIPANT VIDEO (when received) */}
        {hasRemoteVideo ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          /* 2. CALLING / AUDIO-ONLY / WAITING VIEW */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              color: 'white',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  border: '2px solid rgba(0, 168, 132, 0.4)',
                  animation: 'pulseRing 2.2s infinite',
                }}
              />
              <Avatar src={session.initiatorPhotoURL} name={session.initiatorName} size={110} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.4rem', margin: 0, fontFamily: 'var(--font-heading)' }}>
                {session.initiatorName}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#9CA3AF', marginTop: '6px' }}>
                {remoteStream
                  ? 'Connected · Audio Active'
                  : 'Waiting for participants to join...'}
              </p>
            </div>
          </div>
        )}

        {/* 3. LOCAL PARTICIPANT PiP (Picture-in-Picture) PREVIEW */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '190px',
            height: '130px',
            backgroundColor: '#0F1417',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
        >
          {!isVideoOff && localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isMirrored && !isScreenSharing ? 'scaleX(-1)' : 'none',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
              <VideoOff size={28} style={{ margin: '0 auto 4px', opacity: 0.7 }} />
              <small style={{ fontSize: '0.72rem', display: 'block' }}>Camera Off</small>
            </div>
          )}

          {/* Local PiP Label Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '6px',
              left: '6px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              padding: '2px 6px',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>You</span>
            {isMuted ? <span style={{ color: '#EF4444' }}>(Muted)</span> : null}
          </div>
        </div>

        {/* Screen Share Indicator if active */}
        {isScreenSharing && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(0, 168, 132, 0.9)',
              backdropFilter: 'blur(6px)',
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 10,
            }}
          >
            <ScreenShare size={14} /> Screen Sharing
          </div>
        )}
      </div>

      {/* Bottom Floating Control Dock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          padding: '0.85rem 1.75rem',
          borderRadius: 'var(--radius-full)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          zIndex: 10,
        }}
      >
        {/* Toggle Mic */}
        <button
          type="button"
          className="btn-icon"
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: isMuted ? '#EF4444' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            transition: 'all 0.2s ease',
          }}
          onClick={onToggleMic}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Toggle Camera */}
        <button
          type="button"
          className="btn-icon"
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: isVideoOff ? '#EF4444' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            transition: 'all 0.2s ease',
          }}
          onClick={onToggleCam}
          title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
        >
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        {/* Toggle Screen Share */}
        <button
          type="button"
          className="btn-icon"
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: isScreenSharing ? 'var(--color-brand-primary)' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            transition: 'all 0.2s ease',
          }}
          onClick={onToggleScreen}
          title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
        >
          <ScreenShare size={22} />
        </button>

        {/* End Call Button */}
        <button
          type="button"
          className="btn-icon"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#DC2626',
            color: 'white',
            boxShadow: '0 6px 20px rgba(220, 38, 38, 0.6)',
            marginLeft: '0.5rem',
            transition: 'transform 0.15s ease',
          }}
          onClick={onEndCall}
          title="End Call"
        >
          <PhoneOff size={26} />
        </button>
      </div>

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.2; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
