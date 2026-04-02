import { useState } from 'react';
import { HiOutlineX, HiOutlineUpload, HiOutlinePhotograph, HiOutlineCamera } from 'react-icons/hi';
import imageCompression from 'browser-image-compression';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AddPartModal = ({ onClose, onSuccess }) => {
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [uomDimension, setUomDimension] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  // Manual Lookup Logic
  const handleLookup = async () => {
    if (!partNumber || partNumber.length < 3) return;
    setLookingUp(true);
    // Clear previous values to show loading state
    setDescription('');
    setLocation('');
    setUomDimension('');
    
    try {
      const { data } = await API.get(`/parts/lookup/${partNumber}`);
      if (data) {
        setDescription(data.description || '');
        setLocation(data.location || '');
        setUomDimension(data.uomDimension || '');
        toast.success('Part details found!', { id: 'lookup-success' });
      }
    } catch (err) {
      toast.error('Part not found in master list', { id: 'lookup-error' });
    } finally {
      setLookingUp(false);
    }
  };

  const onPartNumberChange = (val) => {
    const cleanVal = val.replace(/\D/g, '');
    setPartNumber(cleanVal);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Compress the image
    setCompressing(true);
    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      const compressed = await imageCompression(file, options);
      setImageFile(compressed);

      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(compressed);

      toast.success(
        `Compressed: ${(file.size / 1024).toFixed(0)}kb → ${(compressed.size / 1024).toFixed(0)}kb`
      );
    } catch (err) {
      toast.error('Image compression failed');
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partNumber.trim()) return toast.error('Part number is required');
    if (!imageFile) return toast.error('Image is required');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('partNumber', partNumber.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('uomDimension', uomDimension.trim());
      formData.append('image', imageFile);

      await API.post('/parts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Part added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add part';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card modal-content-responsive responsive-padding animate-slide-up"
      >
        <div className="bottom-sheet-handle" />
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Part</h2>
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
          {/* Part Number */}
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Part Number *
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={partNumber}
              onChange={(e) => onPartNumberChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field"
              placeholder="Part number"
              style={{ flex: 1, marginBottom: 0 }}
              id="add-part-number"
              autoFocus
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={lookingUp || partNumber.length < 3}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: (lookingUp || partNumber.length < 3) ? 0.6 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!lookingUp && partNumber.length >= 3) {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
              }}
            >
              {lookingUp ? '...' : 'Check'}
            </button>
          </div>

          {/* Part Description */}
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Part Description
          </label>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`input-field ${lookingUp ? 'skeleton-pulse' : ''}`}
              placeholder={lookingUp ? "" : "Auto-filled description"}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div className="form-row-responsive">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`input-field ${lookingUp ? 'skeleton-pulse' : ''}`}
                placeholder={lookingUp ? "" : "Bin Location"}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                UOM Dimension
              </label>
              <input
                type="text"
                value={uomDimension}
                onChange={(e) => setUomDimension(e.target.value)}
                className={`input-field ${lookingUp ? 'skeleton-pulse' : ''}`}
                placeholder={lookingUp ? "" : "Units/Size"}
              />
            </div>
          </div>

          {/* Image Upload */}
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Part Image *
          </label>

          {preview ? (
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreview(null);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                }}
              >
                <HiOutlineX size={14} />
              </button>
            </div>
          ) : compressing ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '32px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                Compressing image...
              </div>
            </div>
          ) : (
            <div className="form-row-responsive">
              {/* Take Photo */}
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1.5px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '24px 12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <HiOutlineCamera size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Open Gallery */}
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1.5px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '24px 12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.borderColor = '#8b5cf6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <HiOutlinePhotograph size={24} style={{ color: '#8b5cf6' }} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || compressing}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            id="submit-add-part"
          >
            <HiOutlineUpload size={18} />
            {loading ? 'Uploading...' : 'Add Part'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPartModal;
