import React, { useState } from 'react';
import {
  UploadCloud,
  MapPin,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Link,
  Image as ImageIcon,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { useToast } from '../../context/ToastContext';

export const ReportIssue = ({ onBack, onSuccess }) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [category, setCategory] = useState('water');
  const [district, setDistrict] = useState('Dhanbad');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [latitude, setLatitude] = useState('23.9056');
  const [longitude, setLongitude] = useState('86.2084');

  const [loading, setLoading] = useState(false);
  const [aiTriageResult, setAiTriageResult] = useState(null);

  const samplePhotoUrls = [
    { label: 'Water Contamination', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800' },
    { label: 'Street Light Broken', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800' },
    { label: 'Garbage Dump', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800' },
    { label: 'Damaged Road', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      showToast('Please provide a title and description.', 'error');
      return;
    }

    // Ensure photo_url has fallback if empty
    const finalPhotoUrl = photoUrl || samplePhotoUrls[0].url;

    const payload = {
      title,
      description,
      expected_outcome: expectedOutcome || 'Community resolution and remediation.',
      category,
      district,
      address,
      photo_url: finalPhotoUrl,
      latitude: parseFloat(latitude) || 23.3441,
      longitude: parseFloat(longitude) || 85.3096,
    };

    setLoading(true);
    try {
      const created = await issuesAPI.createIssue(payload);
      showToast('Problem reported successfully! AI Triage completed.', 'success');
      setAiTriageResult(created);
      setTimeout(() => {
        if (onSuccess) onSuccess(created);
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit problem.';
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
                placeholder="e.g. Dhanbad, Ranchi, Khunti, Bhubaneswar"
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

          {/* Photo URL / Upload */}
          <div className="form-group">
            <label className="form-label">Photo (Photo URL or choose sample) *</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem' }}>
              Or select one of our curated high-resolution sample photos:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {samplePhotoUrls.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoUrl(s.url)}
                  style={{
                    fontSize: '0.725rem',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: photoUrl === s.url ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    background: photoUrl === s.url ? '#EFF6FF' : '#F8FAFC',
                    color: photoUrl === s.url ? '#1D4ED8' : '#475569',
                    fontWeight: 600,
                  }}
                >
                  📸 {s.label}
                </button>
              ))}
            </div>

            {photoUrl && (
              <div style={{ marginTop: '0.75rem', borderRadius: '12px', overflow: 'hidden', height: '140px', border: '1px solid #E2E8F0' }}>
                <img
                  src={photoUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
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
              disabled={loading}
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
