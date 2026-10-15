import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Plus,
  KeyRound,
  Bell,
  Phone,
  Settings as SettingsIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { getGroup, listenGroups } from '../services/groupService';
import { getNotifications } from '../services/notificationService';
import { socketService } from '../services/socketService';
import { useAuth } from '../hooks/useAuth';
import { useTyping } from '../hooks/useTyping';
import { useCalls } from '../hooks/useCalls';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { GroupInfo } from './GroupInfo';
import { IncomingCall } from '../components/calls/IncomingCall';
import { ActiveCallModal } from '../components/calls/ActiveCallModal';
import { GroupInviteModal } from '../components/groups/GroupInviteModal';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';
import { useSettings } from '../store/settingsStore';
import type { Group, Message } from '../../../shared/types';

export function Chat() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuth();
  const [settings] = useSettings();

  const [group, setGroup] = useState<Group | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [unreadNotes, setUnreadNotes] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1);

  const { typingUsers, notifyTyping, notifyStopTyping } = useTyping(groupId, user);
  const {
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
  } = useCalls(user);

  useEffect(() => {
    if ((location.state as any)?.showInvite) {
      setShowInviteModal(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!groupId) return;
    getGroup(groupId)
      .then(setGroup)
      .catch(() => navigate('/'));

    const socket = socketService.getSocket();

    const handleGroupMemberJoined = (data: { groupId: string }) => {
      if (data.groupId === groupId) {
        getGroup(groupId).then(setGroup).catch(() => {});
      }
    };

    const handleGroupMemberLeft = (data: { groupId: string }) => {
      if (data.groupId === groupId) {
        getGroup(groupId).then(setGroup).catch(() => {});
      }
    };

    const handleGroupInfoUpdated = (data: { groupId: string; updates?: Partial<Group> }) => {
      if (data.groupId === groupId) {
        setGroup((prev) => (prev ? { ...prev, ...data.updates } : null));
      }
    };

    const handleGroupPresence = (data: { groupId: string; members: Array<{ userId: string; displayName: string; isOnline: boolean }> }) => {
      if (data.groupId === groupId) {
        const count = Math.max(1, data.members.filter((m) => m.isOnline).length);
        setOnlineCount(count);
      }
    };

    socket?.on('group_member_joined', handleGroupMemberJoined);
    socket?.on('group_member_left', handleGroupMemberLeft);
    socket?.on('group_info_updated', handleGroupInfoUpdated);
    socket?.on('group_presence', handleGroupPresence);

    if (user) {
      const unsub = listenGroups(user.uid, setAllGroups);
      getNotifications()
        .then((n) => setUnreadNotes(n.filter((item) => !item.isRead).length))
        .catch(() => {});
      return () => {
        unsub?.();
        socket?.off('group_member_joined', handleGroupMemberJoined);
        socket?.off('group_member_left', handleGroupMemberLeft);
        socket?.off('group_info_updated', handleGroupInfoUpdated);
        socket?.off('group_presence', handleGroupPresence);
      };
    }

    return () => {
      socket?.off('group_member_joined', handleGroupMemberJoined);
      socket?.off('group_member_left', handleGroupMemberLeft);
      socket?.off('group_info_updated', handleGroupInfoUpdated);
      socket?.off('group_presence', handleGroupPresence);
    };
  }, [groupId, user, navigate]);

  const filteredGroups = allGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container in-chat">
      {/* DESKTOP LEFT SIDEBAR */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem 0.65rem', borderBottom: '1px solid var(--color-border)' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => window.dispatchEvent(new CustomEvent('open_app_branding_modal'))}
            title="Click to personalize app name & logo"
          >
            <img
              src={settings.customAppIcon || '/app-icon.svg'}
              alt={settings.customAppName || 'Group Chat'}
              style={{ width: '28px', height: '28px', borderRadius: '7px', objectFit: 'cover' }}
            />
            <span style={{ fontWeight: 800, fontSize: '1.12rem', color: 'var(--color-brand-primary)', letterSpacing: '-0.02em' }}>
              {settings.customAppName || 'Group Chat'}
            </span>
          </div>
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

        <div className="sidebar-header">
          <div className="user-profile-badge" onClick={() => navigate('/profile')}>
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
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              {unreadNotes > 0 && (
                <span className="badge-counter" style={{ position: 'absolute', top: -2, right: -2 }}>
                  {unreadNotes}
                </span>
              )}
            </button>
            <button className="btn-icon" onClick={() => navigate('/calls')} title="Calls History">
              <Phone size={20} />
            </button>
            <button className="btn-icon" onClick={() => navigate('/settings')} title="Settings">
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>

        <div className="search-container">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search chats..." />
        </div>

        <div className="quick-action-bar">
          <Link to="/groups/new" className="quick-action-btn">
            <Plus size={16} /> <span>New Group</span>
          </Link>
          <Link to="/groups/join" className="quick-action-btn">
            <KeyRound size={16} /> <span>Join Group</span>
          </Link>
        </div>

        <div className="group-list-container">
          {filteredGroups.map((g) => (
            <Link
              key={g.id}
              to={`/chat/${g.id}`}
              className={`group-item ${g.id === groupId ? 'active' : ''}`}
            >
              <Avatar src={g.imageURL} name={g.name} size={48} />
              <div className="group-item-content">
                <div className="group-item-header">
                  <span className="group-name">{g.name}</span>
                  <span className="group-time">
                    {g.lastMessageAt
                      ? new Date(g.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>
                <div className="group-item-sub">
                  <span className="group-preview">{g.lastMessagePreview || g.description || 'No messages'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      {/* MAIN WHATSAPP GROUP CHAT PANEL */}
      <main className="chat-panel">
        {group ? (
          <>
            {/* WhatsApp-Inspired Chat Header:
                Top-left: Notifications icon
                Top-center: Group Name & Avatar (clicking opens detailed Group Info)
                Top-right: EXACTLY TWO BUTTONS: New Post and Voice/Video Call */}
            <ChatHeader
              groupId={groupId}
              name={group.name}
              imageURL={group.imageURL}
              memberCount={group.memberCount}
              onlineCount={onlineCount}
              onBack={() => navigate('/')}
              onOpenInfo={() => setShowInfoDrawer(true)}
              onOpenInvite={() => setShowInviteModal(true)}
              onOpenAnnouncements={() => navigate(`/groups/${groupId}/announcements`)}
              onStartCall={(type) => startCall(groupId, group.name, type)}
              onOpenNotifications={() => navigate('/notifications')}
              onToggleSearch={() => navigate(`/search?groupId=${groupId}`)}
              unreadNotifications={unreadNotes}
            />

            {/* Real-Time Messages Feed */}
            <MessageList
              groupId={groupId}
              typingUsers={typingUsers}
              onReply={(m) => setReplyingTo(m)}
            />

            {/* WhatsApp Input Dock */}
            <MessageInput
              groupId={groupId}
              replyTo={replyingTo}
              onClearReply={() => setReplyingTo(null)}
              onTyping={notifyTyping}
              onStopTyping={notifyStopTyping}
            />
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading group conversation...
          </div>
        )}
      </main>

      {/* DETAILED GROUP INFO SLIDE-OVER DRAWER */}
      {showInfoDrawer && (
        <div className="drawer-overlay" onClick={() => setShowInfoDrawer(false)}>
          <div className="drawer-panel animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                Group Information
              </h2>
              <button className="btn-icon" onClick={() => setShowInfoDrawer(false)} aria-label="Close drawer">
                <X size={20} />
              </button>
            </div>
            <GroupInfo groupId={groupId} onClose={() => setShowInfoDrawer(false)} />
          </div>
        </div>
      )}

      {/* INCOMING CALL ALERT */}
      {incomingCall && (
        <IncomingCall
          session={incomingCall}
          onAccept={acceptCall}
          onDecline={rejectCall}
        />
      )}

      {/* ACTIVE CALL OVERLAY */}
      {activeCall && (
        <ActiveCallModal
          session={activeCall}
          localStream={localStream}
          remoteStream={remoteStream}
          callDuration={callDuration}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          onToggleScreen={toggleScreen}
          onEndCall={endCall}
        />
      )}

      {/* DIRECT INVITATION & QR MODAL */}
      {group && (
        <GroupInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          groupId={groupId}
          groupName={group.name}
          inviteCode={group.activeInviteCode || ''}
        />
      )}
    </div>
  );
}