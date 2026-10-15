import React from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  isOnline?: boolean;
  className?: string;
}

export function Avatar({ src, name = 'User', size = 40, isOnline, className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.38)}px`,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
      {isOnline !== undefined && (
        <span
          className="avatar-online-dot"
          style={{
            backgroundColor: isOnline ? '#22C55E' : '#9CA3AF',
            width: `${Math.max(10, Math.round(size * 0.26))}px`,
            height: `${Math.max(10, Math.round(size * 0.26))}px`,
          }}
        />
      )}
    </div>
  );
}
