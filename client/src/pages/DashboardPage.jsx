import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import PartTable from '../components/PartTable';
import AddPartModal from '../components/AddPartModal';
import EditPartModal from '../components/EditPartModal';
import DeletePartModal from '../components/DeletePartModal';
import ImageModal from '../components/ImageModal';
import DownloadProgressModal from '../components/DownloadProgressModal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineDownload, HiOutlineArchive, HiOutlineDocumentText } from 'react-icons/hi';

const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const [parts, setParts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParts, setTotalParts] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDownloadMenu(false);
      }
    };
    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadMenu]);
  
  // Download Modal state
  const [downloadStatus, setDownloadStatus] = useState(null); // 'preparing', 'downloading', 'complete', 'error'
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [downloadTotalBytes, setDownloadTotalBytes] = useState(0);

  // 300ms debounce for search input (snappier)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [deletePart, setDeletePart] = useState(null);
  const [imagePart, setImagePart] = useState(null);

  // Simple cache for prefetched pages to avoid redundant network hits
  const prefetchCache = useRef({});

  const prefetchPage = useCallback(async (targetPage) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
    if (prefetchCache.current[targetPage]) return;

    try {
      const { data } = await API.get('/parts', {
        params: { page: targetPage, limit: 25, search: debouncedSearch },
      });
      prefetchCache.current[targetPage] = data.parts;
    } catch (err) {
      // Fail silently for pre-fetching
    }
  }, [totalPages, page, debouncedSearch]);

  const fetchParts = useCallback(async () => {
    // If we have cached data from a prefetch, use it immediately
    if (prefetchCache.current[page]) {
      setParts(prefetchCache.current[page]);
      // We still might want to re-fetch in background to keep fresh, 
      // but for speed we show cached first
    }

    setLoading(true);
    try {
      const { data } = await API.get('/parts', {
        params: { page, limit: 25, search: debouncedSearch },
      });
      setParts(data.parts);
      setTotalPages(data.totalPages);
      setTotalParts(data.totalParts);
      // Update cache
      prefetchCache.current[page] = data.parts;
    } catch (err) {
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  // Fetch on mount and when page/search changes
  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  // Reset page and cache when search term changes
  useEffect(() => {
    setPage(1);
    prefetchCache.current = {};
  }, [debouncedSearch]);

  const handleDownloadZip = async () => {
    setDownloadStatus('preparing');
    setDownloadedBytes(0);
    setDownloadTotalBytes(0);
    try {
      const response = await API.get('/parts/export/zip', {
        responseType: 'blob',
        timeout: 300000, // 5 min timeout for large exports
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.loaded > 0) {
            setDownloadStatus('downloading');
            setDownloadedBytes(progressEvent.loaded);
            if (progressEvent.total) {
              setDownloadTotalBytes(progressEvent.total);
            }
          }
        }
      });

      setDownloadStatus('complete');

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tvs-parts-images.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download finished!');

      // Close modal gracefully
      setTimeout(() => setDownloadStatus(null), 2500);
    } catch (err) {
      setDownloadStatus('error');
      toast.error('Failed to download images');
      setTimeout(() => setDownloadStatus(null), 3500);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadStatus('preparing');
    setDownloadedBytes(0);
    setDownloadTotalBytes(0);
    setShowDownloadMenu(false);
    try {
      const response = await API.get('/parts/export/excel', {
        responseType: 'blob',
        timeout: 300000,
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.loaded > 0) {
            setDownloadStatus('downloading');
            setDownloadedBytes(progressEvent.loaded);
            if (progressEvent.total) {
              setDownloadTotalBytes(progressEvent.total);
            }
          }
        }
      });

      setDownloadStatus('complete');

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tvs-parts-list.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Excel Download finished!');

      // Close modal gracefully
      setTimeout(() => setDownloadStatus(null), 2500);
    } catch (err) {
      setDownloadStatus('error');
      toast.error('Failed to download Excel report');
      setTimeout(() => setDownloadStatus(null), 3500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <main
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '16px',
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {/* Title row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Parts Inventory</h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {isAdmin && (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="btn-ghost"
                    disabled={downloadStatus !== null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: downloadStatus !== null ? 0.6 : 1,
                    }}
                    id="download-dropdown-btn"
                  >
                    <HiOutlineDownload size={16} />
                    Download
                  </button>

                  {showDownloadMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '8px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        zIndex: 50,
                        minWidth: '200px',
                        overflow: 'hidden',
                        animation: 'slideDown 0.2s ease',
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowDownloadMenu(false);
                          handleDownloadZip();
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.95rem',
                          color: 'var(--text-primary)',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <HiOutlineArchive size={18} /> ZIP Archive
                      </button>
                      <button
                        onClick={handleDownloadExcel}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.95rem',
                          color: 'var(--text-primary)',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <HiOutlineDocumentText size={18} /> Excel Report
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                id="add-part-btn"
              >
                <HiOutlinePlus size={18} />
                Add Part
              </button>
            </div>
          </div>

          {/* Search */}
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Loading overlay */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            Loading parts...
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Parts table */}
        {!loading && (
          <PartTable
            parts={parts}
            page={page}
            totalPages={totalPages}
            totalParts={totalParts}
            onPageChange={setPage}
            onPrefetch={prefetchPage}
            onImageClick={(part) => setImagePart(part)}
            onEdit={(part) => setEditPart(part)}
            onDelete={(part) => setDeletePart(part)}
            onRefresh={fetchParts}
          />
        )}
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddPartModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchParts}
        />
      )}

      {editPart && (
        <EditPartModal
          part={editPart}
          onClose={() => setEditPart(null)}
          onSuccess={fetchParts}
        />
      )}

      {deletePart && (
        <DeletePartModal
          part={deletePart}
          onClose={() => setDeletePart(null)}
          onSuccess={fetchParts}
        />
      )}

      {imagePart && (
        <ImageModal
          imageUrl={imagePart.imageUrl}
          partNumber={imagePart.partNumber}
          onClose={() => setImagePart(null)}
        />
      )}

      <DownloadProgressModal
        isOpen={downloadStatus !== null}
        status={downloadStatus}
        downloadedBytes={downloadedBytes}
        totalBytes={downloadTotalBytes}
        totalImages={totalParts}
      />
    </div>
  );
};

export default DashboardPage;
