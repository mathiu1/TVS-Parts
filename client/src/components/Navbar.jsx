import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogout, HiOutlineShieldCheck, HiOutlineUser } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: '#fff',
          }}
        >
          TVS
        </div>
        <div>
          <div className="nav-title">
            Parts Manager
          </div>
          <div className="nav-subtitle">
            Warehouse System
          </div>
        </div>
      </div>

      {/* User Info + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            background: isAdmin ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${isAdmin ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {isAdmin ? (
            <HiOutlineShieldCheck size={14} color="#8b5cf6" />
          ) : (
            <HiOutlineUser size={14} color="var(--accent)" />
          )}
          <span className="nav-user-name" style={{ color: isAdmin ? '#a78bfa' : 'var(--accent)' }}>
            {user?.username}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => (e.target.style.color = 'var(--danger)')}
          onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          title="Logout"
        >
          <HiOutlineLogout size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
