import { HiOutlineX } from 'react-icons/hi';

const ImageModal = ({ imageUrl, partNumber, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          transition: 'var(--transition)',
          zIndex: 101,
        }}
      >
        <HiOutlineX size={22} />
      </button>

      {/* Part number label */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '12px 24px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          zIndex: 101,
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.4s ease-out',
        }}
      >
        <span style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.02em'
        }}>
          Part No :
        </span>
        <span style={{
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          {partNumber}
        </span>
      </div>

      {/* Image */}
      <img
        src={imageUrl}
        alt={partNumber}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '85vh',
          objectFit: 'contain',
          borderRadius: 'var(--radius)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
};

export default ImageModal;
