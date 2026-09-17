import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  MapPin,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  Camera,
  Trash2,
  Zap,
  Loader2,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../utils/imageCompressor';

export const ReportIssue = ({ onBack, onSuccess }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [category, setCategory] = useState('water');
  const [district, setDistrict] = useState('Dhanbad');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('23.9056');
  const [longitude, setLongitude] = useState('86.2084');

  // Photo state
  const [uploadTab, setUploadTab] = useState('device'); // 'device' | 'sample' | 'url'
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [compressionStats, setCompressionStats] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [aiTriageResult, setAiTriageResult] = useState(null);

  const samplePhotoUrls = [
    { label: 'Water Contamination', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800' },
    { label: 'Street Light Broken', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800' },
    { label: 'Garbage Dump', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800' },
    { label: 'Damaged Road', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800' },
  ];

  const handleProcessFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP, etc.).', 'error');
      return;
    }

    setIsCompressing(true);
    try {
      const result = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.78,
      });

      setPhotoFile(result.file);
      setPreviewUrl(result.previewUrl);
      setCompressionStats(result);
      setPhotoUrl(''); // Clear manual URL if any
      showToast(`Image compressed! ${result.savingsPercent}% bandwidth saved (${result.originalFormatted} → ${result.compressedFormatted})`, 'success');
    } catch (err) {
      showToast('Failed to compress image: ' + err.message, 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleSelectSample = (url) => {
    setPhotoFile(null);
    setCompressionStats(null);
    setPhotoUrl(url);
    setPreviewUrl(url);
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPreviewUrl('');
    setPhotoUrl('');
    setCompressionStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      showToast('Please provide a title and description.', 'error');
      return;
    }

    if (!photoFile && !photoUrl) {
      showToast('Please provide a photo from device or choose a sample photo.', 'error');
      return;
    }

    setLoading(true);
    try {
      let created;
      if (photoFile) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('expected_outcome', expectedOutcome || 'Community resolution and remediation.');
        formData.append('category', category);
        formData.append('district', district);
        if (address) formData.append('address', address);
        formData.append('latitude', parseFloat(latitude) || 23.3441);
        formData.append('longitude', parseFloat(longitude) || 85.3096);
        formData.append('photo', photoFile);
        if (photoUrl) formData.append('photo_url', photoUrl);
        created = await issuesAPI.createIssue(formData, true);
      } else {
        const payload = {
          title,
          description,
          expected_outcome: expectedOutcome || 'Community resolution and remediation.',
          category,
          district,
          address,
          photo_url: photoUrl ? photoUrl.trim() : '',
          latitude: parseFloat(latitude) || 23.3441,
          longitude: parseFloat(longitude) || 85.3096,
        };
        created = await issuesAPI.createIssue(payload, false);
      }

      showToast('Problem reported successfully! AI Triage completed.', 'success');
      setAiTriageResult(created);
      setTimeout(() => {
        if (onSuccess) onSuccess(created);
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.photo?.[0] || 'Failed to submit problem.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
            Report a Problem
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Help us understand the issue in your area so that universities and local bodies can take action.
          </p>
        </div>
      </div>

      {aiTriageResult && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <Sparkles size={24} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#065F46', marginBottom: '4px' }}>
              AI Triage Verified (Confidence: {Math.round((aiTriageResult.ai_confidence || 0.94) * 100)}%)
            </div>
            <p style={{ fontSize: '0.85rem', color: '#047857' }}>
              {aiTriageResult.ai_triage_notes || 'Triaged and categorized successfully for university review.'}
            </p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter a short title (e.g., Street light not working, Water logging near main road)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe the problem in detail: when it started, how many families are affected, and the urgency."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Expected Outcome */}
          <div className="form-group">
            <label className="form-label">Expected Outcome / What solution is needed?</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Clean drinking water filtration unit or drainage repair"
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
            />
          </div>

          {/* Category & District Grid */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="water">Water & Sanitation</option>
                <option value="urban_infra">Infrastructure & Roads</option>
                <option value="environment">Environment & Waste</option>
                <option value="agriculture">Agriculture & Irrigation</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="energy">Energy & Power</option>
                <option value="transport">Transport</option>
                <option value="public_admin">Public Safety</option>
                <option value="rural_livelihoods">Rural Livelihoods</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">District *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dhanbad, Ranchi, Khunti, East Singhbhum, Bokaro"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Address & GPS Location */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Address / Landmark</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Near Block Office, Topchanchi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GPS Latitude / Longitude</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Latitude (23.9056)"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Longitude (86.2084)"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Photo Evidence Section with Client-Side Compression */}
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontWeight: 700 }}>
                Photo Evidence *
              </label>
              <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <Zap size={13} /> Bandwidth-optimized compression active
              </span>
            </div>

            {/* Upload Method Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                background: '#F1F5F9',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '1rem',
                width: 'fit-content',
              }}
            >
              <button
                type="button"
                onClick={() => setUploadTab('device')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: uploadTab === 'device' ? '#FFFFFF' : 'transparent',
                  color: uploadTab === 'device' ? '#0F172A' : '#64748B',
                  boxShadow: uploadTab === 'device' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Camera size={14} /> Upload from Device
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('sample')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: uploadTab === 'sample' ? '#FFFFFF' : 'transparent',
                  color: uploadTab === 'sample' ? '#0F172A' : '#64748B',
                  boxShadow: uploadTab === 'sample' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <ImageIcon size={14} /> Sample Photos
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('url')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: uploadTab === 'url' ? '#FFFFFF' : 'transparent',
                  color: uploadTab === 'url' ? '#0F172A' : '#64748B',
                  boxShadow: uploadTab === 'url' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <LinkIcon size={14} /> Image Link
              </button>
            </div>

            {/* TAB 1: Device Upload (With In-Browser Compression) */}
            {uploadTab === 'device' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {!previewUrl || !photoFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: isDragging ? '2px dashed #2563EB' : '2px dashed #CBD5E1',
                      borderRadius: '14px',
                      padding: '2rem 1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragging ? '#EFF6FF' : '#F8FAFC',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isCompressing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <Loader2 size={32} color="#2563EB" className="animate-spin" />
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>
                          Compressing image for fast upload...
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Optimizing resolution & preserving clarity while saving bandwidth
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: '#EFF6FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563EB',
                            marginBottom: '4px',
                          }}
                        >
                          <UploadCloud size={26} />
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                          Click to upload or drag & drop photo
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Take a camera photo or choose from device gallery (JPEG, PNG, WebP)
                        </div>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: '#F1F5F9',
                            fontSize: '0.725rem',
                            color: '#475569',
                            fontWeight: 600,
                          }}
                        >
                          <Zap size={12} color="#10B981" />
                          Auto-compressed client-side before sending to save mobile data
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB 2: Sample Photos */}
            {uploadTab === 'sample' && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.6rem' }}>
                  Select one of our curated sample photos for quick testing:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.6rem' }}>
                  {samplePhotoUrls.map((s, idx) => {
                    const isSelected = previewUrl === s.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSample(s.url)}
                        style={{
                          border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          borderRadius: '10px',
                          padding: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <img
                          src={s.url}
                          alt={s.label}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: isSelected ? '#1D4ED8' : '#334155',
                            textAlign: 'center',
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Direct URL Link */}
            {uploadTab === 'url' && (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/evidence-photo.jpg"
                    value={photoUrl}
                    onChange={(e) => {
                      setPhotoFile(null);
                      setCompressionStats(null);
                      setPhotoUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Paste a direct public image link (Unsplash, Imgur, Cloudinary, etc.)
                </span>
              </div>
            )}

            {/* Active Photo Preview & Compression Savings Badge */}
            {previewUrl && (
              <div
                style={{
                  marginTop: '0.9rem',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                  <img
                    src={previewUrl}
                    alt="Problem Preview"
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {photoFile ? photoFile.name : (uploadTab === 'sample' ? 'Curated Sample Photo' : 'Linked Image')}
                    </div>

                    {compressionStats ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          marginTop: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#065F46',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                        }}
                      >
                        <Zap size={12} color="#10B981" />
                        <span>
                          {compressionStats.compressedFormatted} ({compressionStats.savingsPercent}% saved from {compressionStats.originalFormatted})
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: '2px' }}>
                        Ready for problem verification
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {uploadTab === 'device' && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#2563EB',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Change
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      cursor: 'pointer',
                    }}
                    title="Remove Photo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={onBack}
              className="btn btn-outline"
              style={{ borderRadius: '10px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isCompressing}
              className="btn btn-primary"
              style={{ borderRadius: '10px', background: '#5B21B6', padding: '0.65rem 1.75rem' }}
            >
              {loading ? 'Submitting Problem...' : 'Submit Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

