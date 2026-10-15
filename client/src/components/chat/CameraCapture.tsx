import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RotateCw } from 'lucide-react';
import { Modal } from '../common/Modal';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then((s) => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch((err) => {
          console.warn('Camera not available or blocked:', err);
        });
    }

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [isOpen]);

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
    }
  };

  const confirmPhoto = () => {
    if (!capturedPhoto) return;
    fetch(capturedPhoto)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        handleClose();
      });
  };

  const handleClose = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCapturedPhoto(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Camera Snapshot" maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '100%',
            height: '320px',
            backgroundColor: '#1E140F',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Snapshot"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {capturedPhoto ? (
            <>
              <button className="btn-secondary" onClick={() => setCapturedPhoto(null)}>
                <RotateCw size={18} /> Retake
              </button>
              <button className="btn-primary" onClick={confirmPhoto}>
                <Check size={18} /> Send Photo
              </button>
            </>
          ) : (
            <button
              className="send-circle-btn"
              style={{ width: '56px', height: '56px' }}
              onClick={takePhoto}
              title="Capture photo"
            >
              <Camera size={24} />
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
