import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  Share2,
  RefreshCw,
  QrCode,
  Users,
  Shield,
  Trash2,
  LogOut,
  Image,
  FileText,
  Clock,
  Edit,
  VolumeX,
  Volume2,
  Check,
  Download,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import {
  getGroup,
  regenerateInvite,
  leaveGroup,
  deleteGroup,
  getGroupMembers,
  updateMemberRole,
  updateGroup,
} from '../services/groupService';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { GroupInviteModal } from '../components/groups/GroupInviteModal';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../store/settingsStore';
import { socketService } from '../services/socketService';
import type { Group, GroupMember } from '../../../shared/types';

interface GroupInfoProps {
  groupId?: string;
  onClose?: () => void;
}

export function GroupInfo({ groupId: propGroupId, onClose }: GroupInfoProps) {
  const params = useParams();
  const navigate = useNavigate();
  const groupId = propGroupId || params.groupId || '';

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyToast, setCopyToast] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [busy, setBusy] = useState(false);

  // Edit Group state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const currentUser = useAuth();
  const [settings] = useSettings();
  const isAdmin = group?.ownerId === currentUser?.uid;

  useEffect(() => {
    if (!groupId) return;
    getGroup(groupId).then((g) => {
      setGroup(g);
      setEditName(g.name);
      setEditDesc(g.description || '');
      if (g.activeInviteCode) {
        setInviteCode(g.activeInviteCode);
      } else {
        regenerateInvite(groupId)
          .then((res) => setInviteCode(res.code))
          .catch(() => {
            const fallback = groupId.replace(/[^a-zA-Z0-9]/g, '').slice(-7).toUpperCase() || 'JOIN';
            setInviteCode(fallback);
          });
      }
    });

    getGroupMembers(groupId).then(setMembers).catch(() => setMembers([]));

    // Live real-time updates for group members and metadata
    const socket = socketService.getSocket();
    const handleMemberUpdate = (data: { groupId: string }) => {
      if (data.groupId === groupId) {
        getGroupMembers(groupId).then(setMembers).catch(() => {});
        getGroup(groupId).then((g) => {
          setGroup(g);
          if (g.activeInviteCode) setInviteCode(g.activeInviteCode);
        }).catch(() => {});
      }
    };

    socket?.on('group_member_joined', handleMemberUpdate);
    socket?.on('group_member_left', handleMemberUpdate);
    socket?.on('group_info_updated', handleMemberUpdate);

    return () => {
      socket?.off('group_member_joined', handleMemberUpdate);
      socket?.off('group_member_left', handleMemberUpdate);
      socket?.off('group_info_updated', handleMemberUpdate);
    };
  }, [groupId]);

  const getInviteUrl = () => {
    return `${window.location.origin}/join?code=${encodeURIComponent(inviteCode)}`;
  };

  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(''), 3000);
  };

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    showToast('Invite code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!inviteCode) return;
    const url = getInviteUrl();
    navigator.clipboard.writeText(url);
    showToast('Group invite link copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    if (!inviteCode) return;
    const url = getInviteUrl();
    const appTitle = settings.customAppName || 'Chat';
    const text = `Join my group "${group?.name || 'Group'}" on ${appTitle}! Click the link to join: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareInvite = () => {
    const url = getInviteUrl();
    const appTitle = settings.customAppName || 'Chat';
    if (navigator.share) {
      navigator
        .share({
          title: `Join ${group?.name || 'Group'} on ${appTitle}`,
          text: `Use invite code ${inviteCode} to join our group conversation!`,
          url,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('group-invite-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = window.URL.createObjectURL(svgBlob);

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 40, 40, 520, 520);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${(group?.name || 'group').toLowerCase().replace(/\s+/g, '-')}-qr.png`;
      downloadLink.href = pngUrl;
      downloadLink.click();
      window.URL.revokeObjectURL(blobURL);
      showToast('QR Code image downloaded!');
    };
    img.src = blobURL;
  };

  const handleShareQR = async () => {
    const svgElement = document.getElementById('group-invite-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = window.URL.createObjectURL(svgBlob);

    const img = new window.Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 40, 40, 520, 520);
      window.URL.revokeObjectURL(blobURL);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `${(group?.name || 'group').toLowerCase().replace(/\s+/g, '-')}-qr.png`, {
            type: 'image/png',
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: `Join ${group?.name || 'Group'} on ${settings.customAppName || 'Chat'}`,
                text: `Scan or click the link to join: ${getInviteUrl()}`,
                files: [file],
              });
              return;
            } catch {}
          }
        }
        handleShareInvite();
      }, 'image/png');
    };
    img.src = blobURL;
  };

  const handleRegenerateCode = async () => {
    if (!isAdmin) return;
    if (confirm('Regenerate invite code? The previous code will stop working immediately.')) {
      setBusy(true);
      try {
        const res = await regenerateInvite(groupId);
        setInviteCode(res.code);
      } finally {
        setBusy(false);
      }
    }
  };

  const handleSaveGroupInfo = async () => {
    if (!editName.trim()) return;
    setBusy(true);
    try {
      await updateGroup(groupId, { name: editName.trim(), description: editDesc.trim() });
      setGroup((prev) => (prev ? { ...prev, name: editName.trim(), description: editDesc.trim() } : null));
      setIsEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (confirm('Are you sure you want to leave this group?')) {
      await leaveGroup(groupId);
      navigate('/');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to permanently delete this group? This cannot be undone.')) {
      await deleteGroup(groupId);
      navigate('/');
    }
  };

  const handleToggleMemberRole = async (targetUid: string, currentRole: string) => {
    if (!isAdmin) return;
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    await updateMemberRole(groupId, targetUid, newRole);
    setMembers((prev) =>
      prev.map((m) => (m.userId === targetUid ? { ...m, role: newRole as any } : m))
    );
  };

  const filteredMembers = members.filter((m) =>
    (m.displayName || m.userId).toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: '640px', margin: '0 auto', overflowY: 'auto' }}>
      {/* Header Info Banner */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <Avatar src={group?.imageURL} name={group?.name} size={92} />
        </div>

        {isEditing ? (
          <div style={{ display: 'grid', gap: '0.65rem', marginTop: '1rem' }}>
            <input
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                textAlign: 'center',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Group name"
            />
            <textarea
              style={{
                textAlign: 'center',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Group description"
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-primary" disabled={busy} onClick={handleSaveGroupInfo}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.65rem',
                color: 'var(--color-text-primary)',
                marginTop: '0.75rem',
              }}
            >
              {group?.name}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', margin: '0.35rem 0' }}>
              {group?.description || 'No description provided.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              <span>Created {group && new Date(group.createdAt).toLocaleDateString()}</span>
              <span>·</span>
              <span style={{ textTransform: 'capitalize' }}>{group?.visibility || 'Private'} Group</span>
              {isAdmin && (
                <button
                  className="btn-ghost"
                  style={{ padding: '2px 6px', fontSize: '0.78rem' }}
                  onClick={() => setIsEditing(true)}
                  title="Edit Group Info"
                >
                  <Edit size={14} /> Edit
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Unique Encrypted Invite Code Section */}
      <div className="invite-code-card">
        <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-brand-primary)' }}>
          Group Invitation Code
        </span>
        {copyToast && (
          <div
            className="animate-slide-up"
            style={{
              padding: '0.6rem 1rem',
              backgroundColor: '#10B981',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} /> {copyToast}
          </div>
        )}

        <div className="invite-code-display" onClick={handleCopyCode} title="Click to copy code" style={{ cursor: 'pointer' }}>
          {inviteCode || 'GENERATING...'}
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '0.85rem' }}>
          Share this 7-character code or the invite link below.
        </p>

        {/* Sharable link input with copy button */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
          <input
            type="text"
            readOnly
            value={inviteCode ? getInviteUrl() : 'Loading invite link...'}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
              fontSize: '0.82rem',
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
            }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button className="btn-secondary" onClick={handleCopyLink} title="Copy invite link">
            <Copy size={16} />
            <span>Copy Link</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
            onClick={handleShareWhatsApp}
            title="Share directly via WhatsApp"
          >
            <span>Share via WhatsApp</span>
          </button>
          <button className="btn-secondary" onClick={handleShareInvite}>
            <Share2 size={16} />
            <span>Share...</span>
          </button>
          <button className="btn-secondary" onClick={() => setShowQRModal(true)}>
            <QrCode size={16} />
            <span>View QR Code</span>
          </button>
          {isAdmin && (
            <button className="btn-ghost" disabled={busy} onClick={handleRegenerateCode} title="Regenerate code">
              <RefreshCw size={16} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Group Stats Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          margin: '1.25rem 0',
          textAlign: 'center',
        }}
      >
        <div style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <Users size={20} style={{ color: 'var(--color-brand-primary)', margin: '0 auto 4px' }} />
          <b style={{ display: 'block', fontSize: '1.1rem' }}>{group?.memberCount || members.length || 1}</b>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Members</span>
        </div>
        <div
          style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
          onClick={() => navigate(`/groups/${groupId}/media`)}
        >
          <Image size={20} style={{ color: 'var(--color-brand-primary)', margin: '0 auto 4px' }} />
          <b style={{ display: 'block', fontSize: '1.1rem' }}>Media</b>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Photos & Files →</span>
        </div>
        <div
          style={{ background: 'white', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
          onClick={() => navigate(`/groups/${groupId}/announcements`)}
        >
          <FileText size={20} style={{ color: 'var(--color-brand-primary)', margin: '0 auto 4px' }} />
          <b style={{ display: 'block', fontSize: '1.1rem' }}>Posts</b>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Announcements →</span>
        </div>
      </div>

      {/* Member Management List */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '1.25rem', margin: '1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <b style={{ fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
            Group Members ({members.length})
          </b>
        </div>

        <input
          placeholder="Search members..."
          style={{
            width: '100%',
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-light)',
            marginBottom: '0.85rem',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
        />

        {/* WhatsApp-Style Invite Row in Member List */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.75rem 0.75rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-brand-subtle)',
            marginBottom: '0.85rem',
            border: '1px solid var(--color-border)',
            transition: 'background-color 0.15s',
          }}
          onClick={() => setShowQRModal(true)}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserPlus size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: '0.92rem', color: 'var(--color-brand-primary)', display: 'block' }}>
              Invite to group via link or QR code
            </b>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              Share link, Wi-Fi network QR, or send to contacts
            </span>
          </div>
          <QrCode size={18} style={{ color: 'var(--color-brand-primary)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredMembers.map((m) => (
            <div
              key={m.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.25rem',
                borderBottom: '1px solid var(--color-border-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Avatar src={m.photoURL} name={m.displayName || m.userId} size={38} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <b style={{ fontSize: '0.92rem' }}>
                      {m.displayName || m.userId}
                      {m.userId === currentUser?.uid && ' (You)'}
                    </b>
                    <span className="badge badge-role">{m.role}</span>
                  </div>
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                    Joined {new Date(m.joinedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>

              {isAdmin && m.userId !== currentUser?.uid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleToggleMemberRole(m.userId, m.role)}
                  >
                    <Shield size={14} />
                    <span>{m.role === 'admin' ? 'Demote' : 'Make Admin'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone: Leave & Delete */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLeave}>
          <LogOut size={16} /> Leave Group
        </button>

        {isAdmin && (
          <button className="btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDelete}>
            <Trash2 size={16} /> Delete Group Permanently
          </button>
        )}
      </div>

      {/* Shared High-Resolution Group Invite & QR Modal */}
      <GroupInviteModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        groupId={groupId}
        groupName={group?.name || 'Group'}
        inviteCode={inviteCode}
      />
    </div>
  );
}