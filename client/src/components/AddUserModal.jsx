import { useState } from 'react';
import { HiOutlineX, HiOutlineUserAdd, HiOutlineUser, HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AddUserModal = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { adminCreateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await adminCreateUser(username, password, role);
      toast.success(`User "${username}" created as ${role}!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
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
          maxWidth: '440px',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <HiOutlineUserAdd size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 }}>Add New User</h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Admin privilege required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-hover)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <HiOutlineX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <HiOutlineUser
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px' }}
                placeholder="Enter username"
                required
                minLength={3}
                id="add-user-username"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '0.95rem' }}
                placeholder="Min 6 characters"
                required
                minLength={6}
                id="add-user-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: showPassword ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s ease',
                }}
              >
                {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          {/* Role Selector */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineShieldCheck size={16} />
                Assign Role
              </span>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('user')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${role === 'user' ? 'var(--accent)' : 'var(--border)'}`,
                  background: role === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: role === 'user' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <HiOutlineUser size={16} />
                User
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: `1.5px solid ${role === 'admin' ? '#8b5cf6' : 'var(--border)'}`,
                  background: role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  color: role === 'admin' ? '#a78bfa' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <HiOutlineShieldCheck size={16} />
                Admin
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '14px',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
            }}
            id="submit-add-user"
          >
            <HiOutlineUserAdd size={18} />
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
