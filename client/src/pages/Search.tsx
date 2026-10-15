import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, MessageSquare, Users, Image as ImageIcon } from 'lucide-react';
import { searchAll } from '../services/searchService';
import { Avatar } from '../components/common/Avatar';
import { SearchBar } from '../components/common/SearchBar';

export function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'messages' | 'members' | 'media'>('all');
  const [results, setResults] = useState<{ messages: any[]; members: any[]; media: any[] }>({
    messages: [],
    members: [],
    media: [],
  });

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults({ messages: [], members: [], media: [] });
      return;
    }
    const res = await searchAll({ q: val.trim(), type: category }).catch(() => ({
      messages: [],
      members: [],
      media: [],
    }));
    setResults(res);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-secondary)' }}>
      <header className="main-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <button className="btn-icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, maxWidth: '640px' }}>
            <SearchBar value={query} onChange={handleSearch} placeholder="Search messages, members, media..." />
          </div>
        </div>
      </header>

      {/* Filter Chips */}
      <div style={{ padding: '0.65rem 1.5rem', display: 'flex', gap: '0.5rem', backgroundColor: 'white', borderBottom: '1px solid var(--color-border-light)' }}>
        {(['all', 'messages', 'members', 'media'] as const).map((cat) => (
          <button
            key={cat}
            className={`badge ${category === cat ? 'badge-brand' : 'badge-role'}`}
            style={{ cursor: 'pointer', padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
            onClick={() => setCategory(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem max(1rem, calc((100% - 680px) / 2))' }}>
        {!query.trim() ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            <SearchIcon size={36} style={{ color: 'var(--color-brand-primary)', margin: '0 auto 0.5rem' }} />
            <p>Type keywords to search across your groups and messages.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Members Results */}
            {(category === 'all' || category === 'members') && results.members.length > 0 && (
              <section>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-brand-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Members ({results.members.length})
                </h3>
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                  {results.members.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light)' }}>
                      <Avatar src={m.photoURL} name={m.displayName} size={36} />
                      <div>
                        <b>{m.displayName}</b>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>{m.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Messages Results */}
            {(category === 'all' || category === 'messages') && results.messages.length > 0 && (
              <section>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-brand-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Messages ({results.messages.length})
                </h3>
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                  {results.messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer' }}
                      onClick={() => navigate(`/chat/${msg.groupId}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <b style={{ color: 'var(--color-brand-primary)', fontSize: '0.85rem' }}>{msg.senderName}</b>
                        <small style={{ color: 'var(--color-text-muted)' }}>{new Date(msg.createdAt).toLocaleDateString()}</small>
                      </div>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
