import { HiOutlineDownload, HiOutlineExclamationCircle, HiOutlineCheckCircle } from 'react-icons/hi';

const DownloadProgressModal = ({ isOpen, totalImages, downloadedBytes, totalBytes, status }) => {
  if (!isOpen) return null;

  const percentage = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
  const hasTotal = totalBytes > 0;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div
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
        className="glass-card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          {status === 'preparing' || status === 'downloading' ? (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <HiOutlineDownload size={24} className={status === 'downloading' ? 'animate-bounce' : ''} />
            </div>
          ) : status === 'complete' ? (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
              }}
            >
              <HiOutlineCheckCircle size={28} />
            </div>
          ) : (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger)',
              }}
            >
              <HiOutlineExclamationCircle size={28} />
            </div>
          )}
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
          {status === 'preparing' && 'Preparing Export...'}
          {status === 'downloading' && 'Downloading File...'}
          {status === 'complete' && 'Download Complete!'}
          {status === 'error' && 'Download Failed'}
        </h2>

        {status === 'preparing' && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Fetching images from cloud server and compressing into archive. This might take a few moments.
          </p>
        )}

        {(status === 'downloading' || status === 'complete') && (
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '8px',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Images Included</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalImages}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Received Size</span>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                {hasTotal ? `${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)}` : formatBytes(downloadedBytes)}
              </span>
            </div>
          </div>
        )}

        {(status === 'preparing' || status === 'downloading') && (
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                height: '14px',
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: status === 'preparing' ? '100%' : hasTotal ? `${percentage}%` : '100%',
                  background: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #60a5fa)',
                  backgroundSize: '200% 100%',
                  borderRadius: '12px',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
                  animation: status === 'preparing' || (!hasTotal && status === 'downloading') 
                    ? 'shimmer 1.5s infinite linear' 
                    : 'none',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '10px', 
              fontSize: '0.85rem', 
              color: 'var(--text-muted)',
              padding: '0 4px'
            }}>
              <span>{status === 'preparing' ? 'Initializing stream...' : 'Downloading...'}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {status === 'downloading' && hasTotal ? `${percentage}%` : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadProgressModal;
