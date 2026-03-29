import { useState } from 'react';
import { HiOutlineX, HiOutlineTrash, HiOutlineExclamationCircle } from 'react-icons/hi';
import API from '../api/axios';
import toast from 'react-hot-toast';

const DeletePartModal = ({ part, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await API.delete(`/parts/${part._id}`);
      toast.success('Part deleted successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete part';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!part) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
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
          maxWidth: '400px',
          padding: '28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <HiOutlineExclamationCircle size={36} color="var(--danger)" />
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
          Delete Part?
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Are you sure you want to delete part <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>"{part.partNumber}"</span>? 
          This action cannot be undone and will permanently remove the part and its image.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            className="btn-ghost"
            disabled={loading}
            style={{ flex: 1, padding: '12px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger"
            disabled={loading}
            style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <HiOutlineTrash size={18} />
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePartModal;
