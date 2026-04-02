import { HiOutlineX, HiOutlineLocationMarker } from 'react-icons/hi';

const LocationModal = ({ partNumber, locations, onClose }) => {
  const locationList = locations ? locations.split(',').map(l => l.trim()).filter(l => l) : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '20px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <HiOutlineLocationMarker size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Part Locations</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Part No: {partNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-hover)',
              border: 'none',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <HiOutlineX size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {locationList.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              {locationList.map((loc, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ 
                    fontSize: '0.65rem', 
                    color: 'var(--accent)', 
                    background: 'rgba(59, 130, 246, 0.1)',
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {idx + 1}
                  </span>
                  {loc}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px' }}>
              No locations specified.
            </p>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="btn-primary"
          style={{ width: '100%', marginTop: '16px', padding: '10px' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
