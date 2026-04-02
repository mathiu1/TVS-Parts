import { memo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePhotograph,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import LocationModal from './LocationModal';

const PartTable = memo(({ 
  parts, 
  page, 
  totalPages, 
  totalParts, 
  onPageChange, 
  onPrefetch,
  onImageClick, 
  onEdit, 
  onDelete, 
  onRefresh 
}) => {
  const { isAdmin } = useAuth();
  const [selectedLocationPart, setSelectedLocationPart] = useState(null);

  return (
    <div>
      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>{totalParts.toLocaleString()} total parts</span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border)',
                background: 'rgba(59, 130, 246, 0.05)',
              }}
            >
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Part Number
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Part Description
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Location
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                UOM Dimension
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Image
              </th>
              {isAdmin && (
                <th
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {parts.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 7 : 6}
                  style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                  }}
                >
                  No parts found
                </td>
              </tr>
            ) : (
              parts.map((part, index) => (
                <tr
                  key={part._id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'var(--transition)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td
                    style={{
                      padding: '10px 16px',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {(page - 1) * 25 + index + 1}
                  </td>
                  <td
                    style={{
                      padding: '10px 16px',
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: '0.85rem',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {part.partNumber}
                  </td>
                  <td
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      maxWidth: '250px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={part.description}
                  >
                    {part.description || '-'}
                  </td>
                  <td
                    style={{
                      padding: '10px 16px',
                    }}
                  >
                    {part.location ? (
                      (() => {
                        const locs = part.location.split(',').map(l => l.trim()).filter(l => l);
                        if (locs.length <= 1) {
                          return (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {part.location}
                            </span>
                          );
                        }
                        return (
                          <div 
                            className="location-badge"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocationPart(part);
                            }}
                          >
                            <span style={{ fontSize: '0.8rem' }}>{locs[0]}</span>
                            <span className="location-count">+{locs.length - 1}</span>
                          </div>
                        );
                      })()
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {part.uomDimension || '-'}
                  </td>
                  <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(part);
                      }}
                      className="btn-ghost"
                      style={{
                        padding: '6px 12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.8rem',
                        color: 'var(--accent)',
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        background: 'rgba(59, 130, 246, 0.05)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                      }}
                      title="View Image"
                    >
                      <HiOutlinePhotograph size={16} /> Show
                    </button>
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(part);
                          }}
                          className="btn-ghost"
                          style={{
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Edit"
                        >
                          <HiOutlinePencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(part);
                          }}
                          className="btn-danger"
                          style={{
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Delete"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="pagination-wrapper"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => onPageChange(page - 1)}
            onMouseEnter={() => page > 1 && onPrefetch(page - 1)}
            disabled={page <= 1}
            className="btn-ghost pagination-nav-btn"
            style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <HiOutlineChevronLeft size={16} /> <span className="hide-text-mobile">Prev</span>
          </button>

          {/* Page numbers */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {generatePageNumbers(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span
                  key={`dots-${i}`}
                  style={{
                    padding: '6px',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                  }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  onMouseEnter={() => onPrefetch(p)}
                  className="pagination-num-btn"
                  style={{
                    padding: '6px 12px',
                    border: p === page ? 'none' : '1px solid var(--border)',
                    borderRadius: '6px',
                    background: p === page ? 'var(--accent)' : 'transparent',
                    color: p === page ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: p === page ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            onMouseEnter={() => page < totalPages && onPrefetch(page + 1)}
            disabled={page >= totalPages}
            className="btn-ghost pagination-nav-btn"
            style={{
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span className="hide-text-mobile">Next</span> <HiOutlineChevronRight size={16} />
          </button>
        </div>
      )}
      {/* Location Modal */}
      {selectedLocationPart && (
        <LocationModal 
          partNumber={selectedLocationPart.partNumber}
          locations={selectedLocationPart.location}
          onClose={() => setSelectedLocationPart(null)}
        />
      )}
    </div>
  );
});

// Smart page number generator
function generatePageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default PartTable;
