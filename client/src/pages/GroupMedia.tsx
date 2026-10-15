import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Music,
  Link as LinkIcon,
  Download,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { getGroupMedia } from '../services/mediaService';
import { VoiceMessage } from '../components/chat/VoiceMessage';

export function GroupMedia() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'audio' | 'links'>('media');
  const [mediaData, setMediaData] = useState<{
    images: any[];
    videos: any[];
    documents: any[];
    audio: any[];
    links: any[];
  }>({ images: [], videos: [], documents: [], audio: [], links: [] });

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  useEffect(() => {
    if (!groupId) return;
    getGroupMedia(groupId).then(setMediaData).catch(() => {});
  }, [groupId]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <header className="main-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-icon" onClick={() => navigate(`/groups/${groupId}`)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
              Group Media & Files
            </h1>
            <small style={{ color: 'var(--color-text-muted)' }}>Shared photos, videos, documents, and audio</small>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sidebar-tabs" style={{ padding: '0 1.5rem', backgroundColor: 'white' }}>
        <button
          className={`sidebar-tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <ImageIcon size={16} /> Photos & Videos ({mediaData.images.length + mediaData.videos.length})
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          <FileText size={16} /> Documents ({mediaData.documents.length})
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'audio' ? 'active' : ''}`}
          onClick={() => setActiveTab('audio')}
        >
          <Music size={16} /> Voice & Audio ({mediaData.audio.length})
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <LinkIcon size={16} /> Links ({mediaData.links.length})
        </button>
      </div>

      {/* Media Grid / List */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem max(1rem, calc((100% - 920px) / 2))' }}>
        {activeTab === 'media' && (
          <div>
            {mediaData.images.length + mediaData.videos.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
                No photos or videos shared yet.
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                {mediaData.images.map((img, i) => (
                  <div
                    key={i}
                    style={{
                      height: '160px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      boxShadow: 'var(--shadow-sm)',
                      cursor: 'pointer',
                    }}
                    onClick={() => window.open(img.url, '_blank')}
                  >
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                {mediaData.videos.map((vid, i) => (
                  <video
                    key={i}
                    src={vid.url}
                    controls
                    style={{ height: '160px', width: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {mediaData.documents.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
                No documents shared yet.
              </p>
            ) : (
              mediaData.documents.map((doc, i) => (
                <div key={i} className="document-attachment-card">
                  <div className="document-icon-box">
                    <FileText size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: '0.92rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </b>
                    <small style={{ color: 'var(--color-text-muted)' }}>
                      {doc.size ? `${Math.round(doc.size / 1024)} KB` : 'Document'} · {new Date(doc.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <a href={doc.url} download={doc.name} className="btn-icon" title="Download">
                    <Download size={18} />
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {mediaData.audio.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
                No voice messages or audio clips shared yet.
              </p>
            ) : (
              mediaData.audio.map((aud, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <VoiceMessage url={aud.url} duration={aud.duration || 15} />
                  <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                    Shared on {new Date(aud.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mediaData.links.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
                No links shared in this group yet.
              </p>
            ) : (
              mediaData.links.map((link, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-brand-subtle)',
                        color: 'var(--color-brand-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <LinkIcon size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontWeight: 600,
                          fontSize: '0.92rem',
                          color: 'var(--color-brand-primary)',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textDecoration: 'none',
                        }}
                      >
                        {link.url}
                      </a>
                      <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Shared by {link.senderName || 'Member'} · {new Date(link.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      className="btn-icon"
                      onClick={() => handleCopyLink(link.url)}
                      title="Copy URL"
                      style={{ width: '34px', height: '34px' }}
                    >
                      {copiedUrl === link.url ? <Check size={16} style={{ color: '#10B981' }} /> : <Copy size={16} />}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                      title="Open link in new tab"
                      style={{ width: '34px', height: '34px' }}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
