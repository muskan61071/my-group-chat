import React from 'react';
import { Bell, Phone, Plus, Search, MoreVertical, ArrowLeft, QrCode } from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface ChatHeaderProps {
  groupId: string;
  name: string;
  imageURL?: string;
  memberCount?: number;
  onlineCount?: number;
  onOpenInfo: () => void;
  onOpenInvite?: () => void;
  onOpenAnnouncements: () => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onOpenNotifications: () => void;
  onToggleSearch?: () => void;
  onBack?: () => void;
  unreadNotifications?: number;
}

export function ChatHeader({
  name,
  imageURL,
  memberCount = 1,
  onlineCount = 1,
  onOpenInfo,
  onOpenInvite,
  onOpenAnnouncements,
  onStartCall,
  onOpenNotifications,
  onToggleSearch,
  onBack,
  unreadNotifications = 0,
}: ChatHeaderProps) {
  return (
    <header className="main-chat-header">
      {/* Top-Left Corner: Back (on mobile) + Notifications Icon with Badge */}
      <div className="chat-header-left">
        {onBack && (
          <button className="btn-icon" onClick={onBack} title="Back to groups" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
        )}
        <button
          className="btn-icon"
          onClick={onOpenNotifications}
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
      </div>

      {/* Top-Center: Group Name & Avatar, clicking opens detailed Group Information */}
      <div className="chat-header-center" onClick={onOpenInfo} title="View group details & invitation QR code">
        <Avatar src={imageURL} name={name} size={42} isOnline={onlineCount > 0} />
        <div className="chat-header-title-box">
          <span className="chat-header-title">{name}</span>
          <span className="chat-header-subtitle">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
            {onlineCount > 0 && ` · ${onlineCount} online`}
          </span>
        </div>
      </div>

      {/* Top-Right Corner */}
      <div className="chat-header-right">
        {onToggleSearch && (
          <button
            className="btn-icon"
            onClick={onToggleSearch}
            title="Search in chat"
            aria-label="Search chat"
          >
            <Search size={19} />
          </button>
        )}

        {/* Direct Group Invite & QR Code Button */}
        <button
          className="btn-icon"
          onClick={onOpenInvite || onOpenInfo}
          title="Invite to Group via Link or QR Code"
          aria-label="Invite"
        >
          <QrCode size={19} />
        </button>

        {/* 1. New Post Button */}
        <button
          className="header-action-btn btn-new-post"
          onClick={onOpenAnnouncements}
          title="Post group announcement"
        >
          <Plus size={18} />
          <span>New Post</span>
        </button>

        {/* 2. Voice/Video Call Button */}
        <button
          className="header-action-btn btn-call"
          onClick={() => onStartCall('video')}
          title="Start group voice or video call"
        >
          <Phone size={18} />
          <span>Voice/Video Call</span>
        </button>
      </div>
    </header>
  );
}
