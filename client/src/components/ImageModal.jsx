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
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 101,
        }}
      >
        Part No : {partNumber}
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
