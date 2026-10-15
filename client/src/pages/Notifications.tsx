import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCheck, MessageSquare, Phone, UserPlus } from 'lucide-react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';
import type { Notification } from '../../../shared/types';

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await markNotificationAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
    }
    if (n.groupId) {
      navigate(`/chat/${n.groupId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone size={18} style={{ color: 'var(--color-brand-primary)' }} />;
      case 'member_join':
        return <UserPlus size={18} style={{ color: '#10B981' }} />;
      default:
        return <MessageSquare size={18} style={{ color: 'var(--color-brand-primary)' }} />;
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-secondary)' }}>
      <header className="main-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
              Notifications
            </h1>
            <small style={{ color: 'var(--color-text-muted)' }}>Activity, mentions, and updates</small>
          </div>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem max(1rem, calc((100% - 680px) / 2))' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            <Bell size={36} style={{ color: 'var(--color-brand-primary)', margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
              All caught up!
            </p>
            <p style={{ fontSize: '0.85rem' }}>You have no unread notifications.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  backgroundColor: n.isRead ? 'white' : 'var(--color-brand-subtle)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onClick={() => handleClick(n)}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                  {getIcon(n.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-text-primary)' }}>
                    {n.title}
                  </b>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    {n.body}
                  </p>
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
                {!n.isRead && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-brand-primary)' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
