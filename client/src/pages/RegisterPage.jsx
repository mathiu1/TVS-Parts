import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    try {
      await register(username, password, role);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Decorative blurred background elements */}
      <div style={{
        position: 'absolute', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.15)',
        filter: 'blur(100px)', borderRadius: '50%', top: '10%', left: '20%', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px', background: 'rgba(139, 92, 246, 0.1)',
        filter: 'blur(120px)', borderRadius: '50%', bottom: '-10%', right: '10%', zIndex: 0
      }} />

      <div className="glass-card animate-slide-up auth-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            className="auth-logo"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
            }}
          >
            TVS
          </div>
          <h1 className="auth-title">
            Create Account
          </h1>
          <p className="auth-subtitle">
            Join your Parts Manager dashboard
          </p>
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
                placeholder="Choose a username"
                required
                minLength={3}
                id="register-username"
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '0.95rem' }}
                placeholder="Min 6 characters"
                required
                minLength={6}
                id="register-password"
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

          {/* Role */}
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
                Role
              </span>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['user', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${role === r ? 'var(--accent)' : 'var(--border)'}`,
                    background: role === r ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)',
                    color: role === r ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'var(--transition)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              marginTop: '8px'
            }}
            id="register-submit"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
