import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  KeyRound,
  QrCode,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Users,
  Shield,
  LogIn,
} from 'lucide-react';
import jsQR from 'jsqr';
import { joinGroup, previewGroup } from '../../services/groupService';
import { Avatar } from '../common/Avatar';
import type { Group } from '../../../../shared/types';

export function JoinGroupForm() {
  const { inviteCode: paramCode } = useParams<{ inviteCode?: string }>();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'code' | 'scan'>('code');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewGroupData, setPreviewGroupData] = useState<Group | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract clean invite code from scanned QR text or URL
  const extractCode = (raw: string): string => {
    if (!raw) return '';
    try {
      if (raw.includes('code=')) {
        const parsed = new URL(raw, window.location.origin);
        const c = parsed.searchParams.get('code');
        if (c) return c.trim().toUpperCase();
      }
      // If full url with trailing slug /join/:code or /groups/join
      if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
        const parsed = new URL(raw, window.location.origin);
        const match = parsed.pathname.match(/\/join\/([a-zA-Z0-9_-]+)/i);
        if (match && match[1]) {
          return match[1].trim().toUpperCase();
        }
        const parts = parsed.pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1];
        if (last && last.length >= 4 && last.length <= 25) {
          return last.trim().toUpperCase();
        }
      }
    } catch {
      // Fallback
    }
    return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  };

  // Prefill code from URL parameter e.g. /join?code=XYZ or /join/:inviteCode
  useEffect(() => {
    const raw = paramCode || searchParams.get('code');
    if (raw) {
      const clean = extractCode(raw);
      if (clean) {
        setCode(clean);
        setActiveTab('code');
        fetchPreview(clean);
      }
    }
  }, [paramCode, searchParams]);

  // Fetch preview info for code
  const fetchPreview = async (targetCode: string) => {
    const clean = extractCode(targetCode);
    if (!clean || clean.length < 4) return;
    setPreviewBusy(true);
    setError('');
    try {
      const g = await previewGroup(clean);
      setPreviewGroupData(g);
    } catch (err: any) {
      setPreviewGroupData(null);
      setError('Invalid or expired group code.');
    } finally {
      setPreviewBusy(false);
    }
  };

  const handleJoinWithCode = async (targetCode: string) => {
    const cleanCode = extractCode(targetCode);
    if (!cleanCode || cleanCode.length < 4) {
      setError('Please enter a valid invitation code');
      return;
    }

    setBusy(true);
    setError('');
    setSuccessMsg('Joining group conversation...');

    try {
      // Stop camera stream if running
      stopCamera();

      const { groupId } = await joinGroup(cleanCode);
      setSuccessMsg('Joined successfully! Opening chat...');
      setTimeout(() => {
        navigate(`/chat/${groupId}`);
      }, 300);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('network') || msg.includes('fetch')) {
        setError('Unable to join group. Please check your internet connection.');
      } else {
        setError('Invalid or expired group code.');
      }
      setSuccessMsg('');
    } finally {
      setBusy(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoinWithCode(code);
  };

  // Start live camera QR scanner
  const startCamera = async () => {
    setCameraError('');
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        scanFrame();
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      setCameraActive(false);
      setCameraError('Camera access unavailable. You can upload a QR image or enter code manually.');
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Scan continuous video frame with jsQR
  const scanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const decodedQR = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (decodedQR && decodedQR.data) {
      const detected = decodedQR.data;
      const parsedCode = extractCode(detected);
      if (parsedCode) {
        if (navigator.vibrate) navigator.vibrate(100);
        setCode(parsedCode);
        fetchPreview(parsedCode);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    if (activeTab === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, cameraFacing]);

  // Handle uploaded QR code image file
  const handleFileUpload = (file?: File) => {
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

        if (decodedQR && decodedQR.data) {
          const parsed = extractCode(decodedQR.data);
          if (parsed) {
            setCode(parsed);
            fetchPreview(parsed);
            return;
          }
        }
        setError('No valid QR code found in the selected image. Please try a clearer picture.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <header className="main-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-icon" onClick={() => navigate('/')} title="Back">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
              Join Group
            </h1>
            <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              Connect with your team or community
            </small>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '2rem max(1rem, calc((100% - 520px) / 2))', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Dual Mode Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'code' ? 'var(--color-brand-primary)' : 'transparent',
              color: activeTab === 'code' ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <KeyRound size={18} />
            <span>Invite Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'scan' ? 'var(--color-brand-primary)' : 'transparent',
              color: activeTab === 'scan' ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <QrCode size={18} />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div
            className="animate-slide-up"
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #FECACA',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            className="animate-slide-up"
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#ECFDF5',
              color: '#047857',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #A7F3D0',
            }}
          >
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* GROUP PREVIEW CARD WHEN DETECTED */}
        {previewGroupData && (
          <div
            className="animate-slide-up"
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid var(--color-brand-primary)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1rem',
            }}
          >
            <Avatar
              src={previewGroupData.imageURL}
              name={previewGroupData.name}
              size={72}
            />

            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-brand-primary)',
                  letterSpacing: '1px',
                }}
              >
                You're Invited To Join
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  color: 'var(--color-text-primary)',
                  margin: '4px 0 6px',
                }}
              >
                {previewGroupData.name}
              </h2>
              {previewGroupData.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
                  {previewGroupData.description}
                </p>
              )}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                <Users size={14} />
                <span>{previewGroupData.memberCount || 1} members</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={() => handleJoinWithCode(code)}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.85rem',
                fontSize: '1rem',
              }}
            >
              <LogIn size={18} />
              <span>{busy ? 'Connecting to Group...' : 'Join Group Now'}</span>
            </button>
          </div>
        )}

        {/* TAB 1: CODE INPUT */}
        {activeTab === 'code' && !previewGroupData && (
          <form
            onSubmit={handleManualSubmit}
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
              display: 'grid',
              gap: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand-light)',
                color: 'var(--color-brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <KeyRound size={32} />
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.25rem' }}>
                Enter Group Invitation Code
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                Enter the group invitation code or paste the complete invite link.
              </p>
            </div>

            <div>
              <input
                required
                maxLength={40}
                placeholder="A7KF92P"
                className="code"
                style={{
                  fontSize: '1.8rem',
                  textAlign: 'center',
                  letterSpacing: '0.2em',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--color-brand-primary)',
                  backgroundColor: 'var(--color-brand-subtle)',
                  color: 'var(--color-brand-primary)',
                  width: '100%',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
                value={code}
                onChange={(e) => {
                  const val = extractCode(e.target.value);
                  setCode(val);
                  if (val.length >= 6) {
                    fetchPreview(val);
                  }
                }}
              />
            </div>

            <button
              className="btn-primary"
              disabled={busy || previewBusy || code.trim().length < 4}
              style={{ justifyContent: 'center', width: '100%', padding: '0.85rem' }}
            >
              <Sparkles size={18} />
              <span>{busy ? 'Verifying & Connecting...' : 'Join Group'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: QR SCANNER */}
        {activeTab === 'scan' && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '0.2rem' }}>
                Scan Group QR Code
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Align the group's invitation QR code inside the viewfinder
              </p>
            </div>

            {/* Live Camera Scanner Viewport */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '340px',
                height: '340px',
                backgroundColor: '#000000',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: cameraActive ? 'block' : 'none',
                }}
              />

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Viewfinder Target & Green Laser Line */}
              {cameraActive && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '30px',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #10B981, transparent)',
                      boxShadow: '0 0 10px #10B981',
                      animation: 'scanLaser 2.2s infinite ease-in-out',
                    }}
                  />
                  <div style={{ position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTop: '4px solid #10B981', borderLeft: '4px solid #10B981' }} />
                  <div style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTop: '4px solid #10B981', borderRight: '4px solid #10B981' }} />
                  <div style={{ position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottom: '4px solid #10B981', borderLeft: '4px solid #10B981' }} />
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottom: '4px solid #10B981', borderRight: '4px solid #10B981' }} />
                </div>
              )}

              {/* Fallback if camera inactive */}
              {!cameraActive && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9CA3AF' }}>
                  <Camera size={48} style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.85rem', color: '#E5E7EB' }}>
                    {cameraError || 'Starting camera lens...'}
                  </p>
                  <button
                    className="btn-secondary"
                    style={{ marginTop: '0.75rem', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}
                    onClick={startCamera}
                  >
                    <RefreshCw size={14} /> Retry Camera
                  </button>
                </div>
              )}
            </div>

            {/* Camera Actions: Flip Camera / Upload Image */}
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '340px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setCameraFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
              >
                <RefreshCw size={16} />
                <span>Flip Lens</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />

              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                <span>Upload QR</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Embedded style for laser scanning animation */}
      <style>{`
        @keyframes scanLaser {
          0% { top: 5%; opacity: 0.2; }
          50% { top: 92%; opacity: 1; }
          100% { top: 5%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}