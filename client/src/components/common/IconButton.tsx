import React, { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  badge?: number | string;
  variant?: 'ghost' | 'primary' | 'secondary' | 'danger';
}

export function IconButton({ icon, label, badge, variant = 'ghost', className = '', ...props }: IconButtonProps) {
  return (
    <button
      className={`btn-icon ${variant !== 'ghost' ? `btn-${variant}` : ''} ${className}`}
      title={label}
      aria-label={label}
      style={{ position: 'relative' }}
      {...props}
    >
      {icon}
      {badge !== undefined && Number(badge) > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '18px',
            height: '18px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-brand-primary)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid white',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
