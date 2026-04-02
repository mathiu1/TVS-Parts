import { useState } from 'react';
import { HiOutlineX, HiOutlineSave, HiOutlinePhotograph, HiOutlineCamera } from 'react-icons/hi';
import imageCompression from 'browser-image-compression';
import API from '../api/axios';
import toast from 'react-hot-toast';

const EditPartModal = ({ part, onClose, onSuccess }) => {
  const [partNumber, setPartNumber] = useState(part.partNumber);
  const [description, setDescription] = useState(part.description || '');
  const [location, setLocation] = useState(part.location || '');
  const [uomDimension, setUomDimension] = useState(part.uomDimension || '');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(part.imageUrl);
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      toast.success(`Compressed to ${(compressed.size / 1024).toFixed(0)}kb`);
    } catch (err) {
      toast.error('Image compression failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partNumber.trim()) return toast.error('Part number is required');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('partNumber', partNumber.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('uomDimension', uomDimension.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await API.put(`/parts/${part._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Part updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update part';
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Part</h2>
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
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value.replace(/\D/g, ''))}
            className="input-field"
            style={{ marginBottom: '24px' }}
            id="edit-part-number"
          />

          {/* Part Description */}
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Part Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            placeholder="Part description"
            style={{ marginBottom: '24px' }}
          />

          <div className="form-row-responsive">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
                placeholder="Bin Location"
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
                className="input-field"
                placeholder="Units/Size"
              />
            </div>
          </div>

          {/* Image */}
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            Part Image
          </label>

          <div style={{ marginBottom: '16px' }}>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  marginBottom: '8px',
                }}
              />
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                }}
              >
                <HiOutlineCamera size={18} />
                Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#8b5cf6',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                }}
              >
                <HiOutlinePhotograph size={18} />
                Gallery
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            id="submit-edit-part"
          >
            <HiOutlineSave size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPartModal;
