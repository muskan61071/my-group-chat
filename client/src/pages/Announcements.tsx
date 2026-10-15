import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageSquare, Heart, Pin, Send, Paperclip } from 'lucide-react';
import {
  getAnnouncements,
  createAnnouncement,
  reactAnnouncement,
  getComments,
  addComment,
} from '../services/announcementService';
import { uploadMedia } from '../services/mediaService';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import type { Announcement, AnnouncementComment } from '../../../shared/types';

export function Announcements() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [attachment, setAttachment] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  // Comments state
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(null);
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!groupId) return;
    getAnnouncements(groupId).then(setAnnouncements).catch(() => setAnnouncements([]));
  }, [groupId]);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    try {
      const item = await createAnnouncement(groupId, {
        title: title.trim(),
        content: content.trim(),
        attachment,
        isPinned,
      });
      setAnnouncements((prev) => [item, ...prev]);
      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setAttachment(null);
      setIsPinned(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to publish announcement');
    } finally {
      setBusy(false);
    }
  };

  const handleReact = async (id: string, emoji: string) => {
    await reactAnnouncement(groupId, id, emoji);
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const current = a.reactions[emoji] || [];
        const set = new Set(current);
        if (user && set.has(user.uid)) set.delete(user.uid);
        else if (user) set.add(user.uid);
        return { ...a, reactions: { ...a.reactions, [emoji]: Array.from(set) } };
      })
    );
  };

  const handleOpenComments = async (id: string) => {
    setActiveAnnouncementId(id);
    const list = await getComments(groupId, id).catch(() => []);
    setComments(list);
  };

  const handleAddComment = async () => {
    if (!activeAnnouncementId || !commentText.trim()) return;
    const text = commentText.trim();
    setCommentText('');
    const c = await addComment(groupId, activeAnnouncementId, text);
    setComments((prev) => [...prev, c]);
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === activeAnnouncementId ? { ...a, commentCount: a.commentCount + 1 } : a))
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <header className="main-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-icon" onClick={() => navigate(`/chat/${groupId}`)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
              Group Announcements
            </h1>
            <small style={{ color: 'var(--color-text-muted)' }}>Official announcements and updates</small>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Publish Announcement
        </button>
      </header>

      {/* Feed Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem max(1rem, calc((100% - 720px) / 2))' }}>
        {announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
              No announcements published yet.
            </p>
            <p style={{ fontSize: '0.9rem' }}>Click "Publish Announcement" to post an official broadcast to all members.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {announcements.map((a) => (
              <article
                key={a.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Author row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Avatar src={a.authorPhotoURL} name={a.authorName} size={42} />
                    <div>
                      <b style={{ fontSize: '0.95rem' }}>{a.authorName}</b>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {a.isPinned && (
                    <span className="badge badge-brand" style={{ gap: '4px' }}>
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                </div>

                {/* Content */}
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-brand-dark)' }}>
                  {a.title}
                </h2>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
                  {a.content}
                </p>

                {a.attachment && (
                  <img
                    src={a.attachment.url}
                    alt="Announcement banner"
                    style={{ borderRadius: 'var(--radius-md)', maxHeight: '320px', width: '100%', objectFit: 'cover', marginTop: '1rem' }}
                  />
                )}

                {/* Actions row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }} onClick={() => handleReact(a.id, '❤️')}>
                      <Heart size={15} /> {a.reactions?.['❤️']?.length || 0}
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }} onClick={() => handleReact(a.id, '👍')}>
                      👍 {a.reactions?.['👍']?.length || 0}
                    </button>
                  </div>

                  <button className="btn-ghost" onClick={() => handleOpenComments(a.id)}>
                    <MessageSquare size={16} /> {a.commentCount || 0} Comments
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Create Announcement Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Group Announcement">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Title
            <input
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              placeholder="Important Update..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label style={{ display: 'grid', gap: '4px', fontWeight: 600 }}>
            Content
            <textarea
              rows={4}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
              placeholder="Write the announcement details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Pin this announcement to the top</span>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={busy} onClick={handleCreate}>
              Publish
            </button>
          </div>
        </div>
      </Modal>

      {/* Comments Drawer / Modal */}
      <Modal isOpen={!!activeAnnouncementId} onClose={() => setActiveAnnouncementId(null)} title="Announcement Comments">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {comments.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={{ display: 'flex', gap: '0.65rem', backgroundColor: 'var(--color-bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <Avatar src={c.userPhotoURL} name={c.userName} size={32} />
                  <div>
                    <b style={{ fontSize: '0.85rem' }}>{c.userName}</b>
                    <p style={{ margin: '2px 0 0', fontSize: '0.88rem' }}>{c.content}</p>
                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                      {new Date(c.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem' }}>
            <input
              style={{ flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddComment();
              }}
            />
            <button className="btn-primary" onClick={handleAddComment}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
