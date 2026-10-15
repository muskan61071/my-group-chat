import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  Check,
  Share2,
  Download,
  QrCode,
  Globe,
  Wifi,
  Send,
  Sparkles,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { regenerateInvite } from '../../services/groupService';
import { apiClient } from '../../api/apiClient';

interface GroupInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  inviteCode: string;
}

export function GroupInviteModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  inviteCode,
}: GroupInviteModalProps) {
  const [currentCode, setCurrentCode] = useState(inviteCode || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [networkMode, setNetworkMode] = useState<'public' | 'lan' | 'local'>('public');
  const [publicTunnelUrl, setPublicTunnelUrl] = useState('https://81b6bc4a8597e8eb-49-43-218-228.serveousercontent.com');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch live system public tunnel URL if available
    apiClient
      .get('/api/system/branding')
      .then((res) => {
        if (res.data?.branding?.publicTunnelUrl) {
          setPublicTunnelUrl(res.data.branding.publicTunnelUrl);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (inviteCode) {
      setCurrentCode(inviteCode);
    } else if (isOpen && groupId) {
      setBusy(true);
      regenerateInvite(groupId)
        .then((res) => setCurrentCode(res.code))
        .catch(() => {
          const fallback = groupId.replace(/[^a-zA-Z0-9]/g, '').slice(-7).toUpperCase() || 'HIVETALK';
          setCurrentCode(fallback);
        })
        .finally(() => setBusy(false));
    }
  }, [inviteCode, isOpen, groupId]);

  const activeCode = currentCode || inviteCode;

  // Compute base URL according to chosen network target
  const getBaseUrl = () => {
    if (networkMode === 'public') {
      return publicTunnelUrl || window.location.origin;
    }
    if (networkMode === 'lan') {
      const port = window.location.port || '8080';
      return `http://192.168.29.90:${port}`;
    }
    return window.location.origin;
  };

  const inviteUrl = activeCode ? `${getBaseUrl()}/join?code=${encodeURIComponent(activeCode)}` : '';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCopyCode = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    showToast(`Invite code ${activeCode} copied!`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    showToast('Group invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!inviteUrl) return;
    const text = `Join my WhatsApp group "${groupName}"! Click here to join: ${inviteUrl} (Or enter group code: ${activeCode})`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareLink = async () => {
    if (!inviteUrl) return;
    const text = `Join our group "${groupName}" on HiveTalk! Click to join: ${inviteUrl} (Code: ${activeCode})`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName}`,
          text,
          url: inviteUrl,
        });
        return;
      } catch {}
    }

    handleShareWhatsApp();
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40, 520, 520);
      }
      const pngFile = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `hivetalk-${groupName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr.png`;
      a.href = pngFile;
      a.click();
      showToast('QR Code image downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShareQR = async () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        canvas.width = 600;
        canvas.height = 600;
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 40, 40, 520, 520);
        }

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `hivetalk-invite-${inviteCode}.png`, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Join ${groupName}`,
              text: `Scan to join ${groupName} on HiveTalk: ${inviteUrl}`,
            });
          } else {
            handleDownloadQR();
          }
        }, 'image/png');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch {
      handleDownloadQR();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invite to ${groupName}`}>
      <div style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
        {toastMsg && (
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--color-brand-primary)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1rem',
              animation: 'fadeIn 0.2s',
            }}
          >
            {toastMsg}
          </div>
        )}

        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
          Anyone with this link or QR code can join <b>{groupName}</b> directly without approval.
        </p>

        {/* Network Target Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setNetworkMode('public')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: networkMode === 'public' ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
              backgroundColor: networkMode === 'public' ? 'var(--color-brand-subtle)' : 'var(--color-bg-secondary)',
              color: networkMode === 'public' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Globe size={14} />
            <span>Public URL (Worldwide)</span>
          </button>

          <button
            type="button"
            onClick={() => setNetworkMode('lan')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: networkMode === 'lan' ? '1.5px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
              backgroundColor: networkMode === 'lan' ? 'var(--color-brand-subtle)' : 'var(--color-bg-secondary)',
              color: networkMode === 'lan' ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Wifi size={14} />
            <span>Local Wi-Fi (LAN)</span>
          </button>
        </div>


        {/* High-Resolution Scannable QR Code */}
        <div
          ref={qrRef}
          style={{
            display: 'inline-block',
            padding: '1.25rem',
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '2px solid var(--color-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          <QRCodeSVG
            value={inviteUrl}
            size={220}
            level="H"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Alphanumeric Invite Code Display */}
        <div
          style={{
            margin: '1.25rem 0 1rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px dashed var(--color-brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
              Invitation Code:
            </span>
            <code
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--color-brand-primary)',
                letterSpacing: '2px',
              }}
            >
              {activeCode || 'LOADING...'}
            </code>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopyCode}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', gap: '4px' }}
          >
            {copiedCode ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Link input preview */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '1.25rem',
            backgroundColor: 'var(--color-bg-secondary)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-light)',
          }}
        >
          <input
            type="text"
            readOnly
            value={inviteUrl}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '0.8rem',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            {copiedLink ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}
            <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-primary"
            style={{
              justifyContent: 'center',
              padding: '0.65rem',
              fontSize: '0.82rem',
              gap: '6px',
              backgroundColor: '#25D366',
              borderColor: '#25D366',
              color: '#FFFFFF',
            }}
            onClick={handleShareWhatsApp}
          >
            <MessageCircle size={16} />
            <span>Send via WhatsApp</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.82rem', gap: '6px' }}
            onClick={handleShareLink}
          >
            <Share2 size={16} />
            <span>Share Link</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.82rem', gap: '6px' }}
            onClick={handleDownloadQR}
          >
            <Download size={16} />
            <span>Save QR Image</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.82rem', gap: '6px' }}
            onClick={handleShareQR}
          >
            <QrCode size={16} />
            <span>Share QR Code</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
