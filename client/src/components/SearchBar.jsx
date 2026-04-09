import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

const SearchBar = ({ value, onChange }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <HiOutlineSearch
        size={18}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        placeholder="Search parts..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        style={{
          paddingLeft: '38px',
          paddingRight: value ? '36px' : '14px',
        }}
        id="search-parts"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--bg-hover)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'var(--transition)',
          }}
        >
          <HiOutlineX size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
