import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Camera,
  MapPin,
  User,
  CreditCard,
  Music,
} from 'lucide-react';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: () => void;
  onSelectPhotos: () => void;
  onSelectCamera: () => void;
  onSelectLocation: () => void;
  onSelectContact: () => void;
  onSelectPayment: () => void;
}

export function AttachmentMenu({
  isOpen,
  onClose,
  onSelectDocument,
  onSelectPhotos,
  onSelectCamera,
  onSelectLocation,
  onSelectContact,
  onSelectPayment,
}: AttachmentMenuProps) {
  if (!isOpen) return null;

  const items = [
    {
      label: 'Document',
      icon: <FileText size={22} />,
      color: '#5B68E4',
      bg: '#EEF0FD',
      action: onSelectDocument,
    },
    {
      label: 'Photos & Videos',
      icon: <ImageIcon size={22} />,
      color: '#8B5E3C',
      bg: '#F8F1EB',
      action: onSelectPhotos,
    },
    {
      label: 'Camera',
      icon: <Camera size={22} />,
      color: '#D946EF',
      bg: '#FDF2F8',
      action: onSelectCamera,
    },
    {
      label: 'Location',
      icon: <MapPin size={22} />,
      color: '#10B981',
      bg: '#ECFDF5',
      action: onSelectLocation,
    },
    {
      label: 'Contact',
      icon: <User size={22} />,
      color: '#0284C7',
      bg: '#F0F9FF',
      action: onSelectContact,
    },
    {
      label: 'Payment',
      icon: <CreditCard size={22} />,
      color: '#F59E0B',
      bg: '#FFFBEB',
      action: onSelectPayment,
    },
  ];

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
        onClick={onClose}
      />
      <div
        className="animate-slide-up"
        style={{
          position: 'absolute',
          bottom: '68px',
          left: '1rem',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 12px 32px rgba(45, 31, 23, 0.16)',
          padding: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          zIndex: 45,
          width: '280px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item) => (
          <button
            key={item.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem',
              borderRadius: 'var(--radius-md)',
              transition: 'transform 0.15s',
            }}
            onClick={() => {
              item.action();
              onClose();
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {item.icon}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
