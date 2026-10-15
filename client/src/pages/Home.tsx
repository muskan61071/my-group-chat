import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  KeyRound,
  Bell,
  Phone,
  Settings as SettingsIcon,
  Users,
  QrCode,
  Sparkles,
  Download,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { listenGroups } from '../services/groupService';
import { getNotifications } from '../services/notificationService';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import { GroupInviteModal } from '../components/groups/GroupInviteModal';
import { InstallGuideModal } from '../components/common/InstallGuideModal';
import { useSettings } from '../store/settingsStore';
import { usePwaInstall } from '../hooks/usePwaInstall';
import type { Group } from '../../../shared/types';

export function Home() {
  const user = useAuth();
  const navigate = useNavigate();
  const [settings] = useSettings();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [selectedInviteGroup, setSelectedInviteGroup] = useState<Group | null>(null);
  const { isStandalone, canPromptDirectly, isInstallModalOpen, setIsInstallModalOpen, triggerInstall } = usePwaInstall();

  useEffect(() => {
    if (!user) return;
    const unsub = listenGroups(user.uid, setGroups);
    getNotifications()
      .then((notes) => setUnreadNotifications(notes.filter((n) => !n.isRead).length))
      .catch(() => {});

    return () => unsub?.();
  }, [user]);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem 0.65rem', borderBottom: '1px solid var(--color-border)' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => window.dispatchEvent(new CustomEvent('open_app_branding_modal'))}
            title="Click to personalize app name & logo"
          >
            <img src={settings.customAppIcon || '/app-icon.svg'} alt={settings.customAppName || 'Group Chat'} style={{ width: '28px', height: '28px', borderRadius: '7px', objectFit: 'cover' }} />
            <span style={{ fontWeight: 800, fontSize: '1.12rem', color: 'var(--color-brand-primary)', letterSpacing: '-0.02em' }}>
              {settings.customAppName || 'Group Chat'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!isStandalone && (
              <button
                type="button"
                onClick={triggerInstall}
                title={`Install ${settings.customAppName || 'App'} on your device`}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Download size={12} />
                <span>Install</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open_app_branding_modal'))}
              title="Personalize app name & logo"
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-brand-primary)',
                background: 'var(--color-brand-subtle)',
                padding: '3px 8px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={12} />
              <span>Personalize</span>
            </button>
          </div>
        </div>

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div
            className="user-profile-badge"
            onClick={() => navigate('/profile')}
            title="Edit your profile"
          >
            <Avatar src={user?.photoURL} name={user?.displayName || 'User'} size={40} isOnline={true} />
            <div style={{ minWidth: 0 }}>
              <b style={{ fontSize: '0.92rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.displayName || user?.email}
              </b>
              <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Online</small>
            </div>
          </div>

          <div className="sidebar-actions">
            <button
              className="btn-icon"
              onClick={() => navigate('/notifications')}
              title="Notifications"
              aria-label="Notifications"
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="badge-counter" style={{ position: 'absolute', top: -2, right: -2 }}>
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              className="btn-icon"
              onClick={() => navigate('/calls')}
              title="Calls History"
              aria-label="Calls"
            >
              <Phone size={20} />
            </button>
            <button
              className="btn-icon"
              onClick={() => navigate('/settings')}
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search recent groups..."
          />
        </div>

        {/* Quick Action Buttons: Create New Group & Join Existing Group */}
        <div className="quick-action-bar">
          <Link to="/groups/new" className="quick-action-btn">
            <Plus size={16} />
            <span>New Group</span>
          </Link>
          <Link to="/groups/join" className="quick-action-btn">
            <KeyRound size={16} />
            <span>Join Group</span>
          </Link>
        </div>

        {/* Recent Groups List */}
        <div className="group-list-container">
          {filteredGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1.25rem', color: 'var(--color-text-muted)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Users size={24} />
              </div>
              <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>No groups yet</p>
              <p style={{ fontSize: '0.82rem', marginBottom: '1.25rem', lineHeight: 1.45 }}>
                Create your first group or join with an invite code to start chatting.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/groups/new" className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Create Group
                </Link>
                <Link to="/groups/join" className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                  <KeyRound size={16} /> Join Group
                </Link>
              </div>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={`/chat/${group.id}`}
                className="group-item"
              >
                <Avatar src={group.imageURL} name={group.name} size={48} />
                <div className="group-item-content">
                  <div className="group-item-header">
                    <span className="group-name">{group.name}</span>
                    <span className="group-time">
                      {group.lastMessageAt
                        ? new Date(group.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(group.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="group-item-sub">
                    <span className="group-preview">
                      {group.lastMessagePreview || group.description || 'Tap to open chat'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                        title={`Invite to ${group.name}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedInviteGroup(group);
                        }}
                      >
                        <QrCode size={15} style={{ color: 'var(--color-brand-primary)' }} />
                      </button>
                      <span className="badge badge-role">
                        {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </aside>

      {/* RIGHT MAIN PANEL (Welcome / Empty State when on home) */}
      <main className="chat-panel" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '480px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img
              src={settings.customAppIcon || '/app-icon.svg'}
              alt={settings.customAppName || 'App Icon'}
              style={{ width: '88px', height: '88px', borderRadius: '22px', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }}
            />
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', color: 'var(--color-brand-dark)', marginBottom: '0.5rem' }}>
            {settings.customAppName || 'Group Chat'}
          </h1>
          {user?.displayName && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'var(--color-brand-subtle)', borderRadius: '20px', marginBottom: '0.85rem', color: 'var(--color-brand-primary)', fontWeight: 600, fontSize: '0.88rem' }}>
              <span>Signed in as <strong>{user.displayName}</strong></span>
            </div>
          )}
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '2rem' }}>
            Real-time group conversations with voice & video calling, rich media sharing, announcements, and instant invite codes.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/groups/new" className="btn-primary">
              <Plus size={18} /> Create a Group
            </Link>
            <Link to="/groups/join" className="btn-secondary">
              <KeyRound size={18} /> Join Existing Group
            </Link>
          </div>
        </div>
      </main>

      {/* QUICK GROUP INVITE MODAL FROM SIDEBAR */}
      {selectedInviteGroup && (
        <GroupInviteModal
          isOpen={!!selectedInviteGroup}
          onClose={() => setSelectedInviteGroup(null)}
          groupId={selectedInviteGroup.id}
          groupName={selectedInviteGroup.name}
          inviteCode={selectedInviteGroup.activeInviteCode || ''}
        />
      )}

      {/* PWA INSTALLATION GUIDE MODAL */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        canPromptDirectly={canPromptDirectly}
        onNativePrompt={triggerInstall}
      />
    </div>
  );
}