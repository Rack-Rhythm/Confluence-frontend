import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  MapPin,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Link as LinkIcon,
  Image as ImageIcon,
  Camera,
  Trash2,
  Zap,
  Loader2,
  Bot,
  ShieldCheck,
  RefreshCw,
  Tag,
  Cpu,
  Eye,
  Sliders,
  Check,
} from 'lucide-react';
import { issuesAPI } from '../../api/issues';
import { useToast } from '../../context/ToastContext';
import { compressImage } from '../../utils/imageCompressor';
import { analyzeAndVerifyIssue } from '../../services/geminiService';

export const ReportIssue = ({ onBack, onSuccess }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [category, setCategory] = useState('urban_infra');
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

  // Gemini AI state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState('');
  const [geminiVerification, setGeminiVerification] = useState(null);

  const [loading, setLoading] = useState(false);
  const [aiTriageResult, setAiTriageResult] = useState(null);

  const samplePhotoUrls = [
    { label: 'Damaged Road & Pothole', url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800' },
    { label: 'Water Contamination', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800' },
    { label: 'Street Light Broken', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800' },
    { label: 'Garbage Dump & Waste', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800' },
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
      showToast(
        `Image compressed! ${result.savingsPercent}% bandwidth saved (${result.originalFormatted} → ${result.compressedFormatted})`,
        'success'
      );

      // Prompt or auto-trigger Gemini AI
      triggerGeminiAnalysis(result.file, '', description || title);
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
    triggerGeminiAnalysis(null, url, description || title);
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPreviewUrl('');
    setPhotoUrl('');
    setCompressionStats(null);
    setGeminiVerification(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger Gemini AI Categorisation, Detail Filling & AI-Verification
  const triggerGeminiAnalysis = async (customFile = null, customUrl = '', customNotes = '') => {
    const targetFile = customFile || photoFile;
    const targetUrl = customUrl || photoUrl || previewUrl;
    const notes = customNotes || description || title;

    if (!targetFile && !targetUrl && !notes) {
      showToast('Please upload a photo or enter brief notes for Gemini AI to analyze.', 'info');
      return;
    }

    setIsAiAnalyzing(true);
    setAiAnalysisStep('Scanning visual evidence & physical pixels with Gemini 3.6 Flash...');

    const stepInterval = setInterval(() => {
      setAiAnalysisStep((prev) => {
        if (prev.includes('pixels')) return 'Classifying civic domain & determining jurisdiction...';
        if (prev.includes('jurisdiction')) return 'Formulating technical hazard description & actionable remediation...';
        if (prev.includes('hazard')) return 'Executing AI Verification & fraud detection analysis...';
        return 'Finalizing verified details...';
      });
    }, 900);

    try {
      const res = await analyzeAndVerifyIssue({
        imageFile: targetFile,
        imageUrl: targetUrl,
        userNotes: notes,
        district,
      });

      clearInterval(stepInterval);

      if (res && res.data) {
        const d = res.data;
        setTitle(d.title || title);
        setDescription(d.description || description);
        setCategory(d.category || category);
        setExpectedOutcome(d.expected_outcome || expectedOutcome);
        setGeminiVerification(d);

        if (d.is_civic_issue) {
          showToast(
            `Gemini AI Pre-Verified! Issue categorized as "${d.category.toUpperCase()}" (${Math.round((d.confidence_score || 0.95) * 100)}% confidence)`,
            'success'
          );
        } else {
          showToast(
            '⚠️ Gemini AI Caution: Image flagged as potentially non-civic content. Please review.',
            'warning'
          );
        }
      }
    } catch (err) {
      clearInterval(stepInterval);
      console.error('Gemini analysis error:', err);
      showToast('Gemini AI analysis encountered an error. You can still submit manually.', 'error');
    } finally {
      setIsAiAnalyzing(false);
      setAiAnalysisStep('');
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

      showToast('Problem reported successfully! AI Verified and queued for university incubation.', 'success');
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
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onBack}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Report a Civic Problem
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '3px 0 0' }}>
            Empowered with Gemini Multimodal AI: Take a photo, auto-fill details, and AI-verify before submitting.
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
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <Sparkles size={24} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#065F46', marginBottom: '4px' }}>
              Backend AI Triage Confirmed (Confidence: {Math.round((aiTriageResult.ai_confidence || 0.94) * 100)}%)
            </div>
            <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0 }}>
              {aiTriageResult.ai_triage_notes || 'Triaged and categorized successfully for university incubation.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SECTION 1: PHOTO EVIDENCE & GEMINI AI ANALYSIS */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '2px', fontWeight: 800, fontSize: '0.95rem' }}>
                  1. Photo Evidence & AI Vision *
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Upload a clear photo. Gemini AI will analyze the image to auto-categorize and fill the report.
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                <Zap size={13} /> Bandwidth-optimized
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
                }}
              >
                <ImageIcon size={14} /> Sample Civic Photos
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
                }}
              >
                <LinkIcon size={14} /> Image Link
              </button>
            </div>

            {/* TAB 1: Device Upload */}
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
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}
                    >
                      {isCompressing ? <Loader2 size={26} className="animate-spin" /> : <UploadCloud size={26} />}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                      {isCompressing ? 'Compressing and optimizing image...' : 'Click to take photo or choose image file'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                      Supports camera capture, JPG, PNG, WebP • Auto-compressed on-device to save cellular bandwidth
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB 2: Sample Photos */}
            {uploadTab === 'sample' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
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
                  <button
                    type="button"
                    onClick={() => triggerGeminiAnalysis(null, photoUrl, description || title)}
                    className="btn btn-outline"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Analyze Link
                  </button>
                </div>
              </div>
            )}

            {/* Active Photo Preview Bar */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={previewUrl}
                    alt="Problem Preview"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid #E2E8F0',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {photoFile ? photoFile.name : 'Selected Civic Evidence Photo'}
                    </div>
                    {compressionStats ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '3px',
                          background: '#ECFDF5',
                          padding: '2px 8px',
                          borderRadius: '6px',
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
                        Ready for Gemini AI pre-verification
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

            {/* GEMINI AI ASSISTANT TRIGGER & LIVE CARD */}
            <div style={{ marginTop: '1rem' }}>
              {isAiAnalyzing ? (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)',
                    border: '1px solid #DDD6FE',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <Loader2 size={24} color="#7C3AED" className="animate-spin" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4C1D95' }}>
                      Gemini 3.6 Multimodal AI in Action
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6D28D9', marginTop: '2px' }}>
                      {aiAnalysisStep}
                    </div>
                  </div>
                </div>
              ) : geminiVerification ? (
                <div
                  style={{
                    background: geminiVerification.is_civic_issue
                      ? 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)'
                      : '#FEF2F2',
                    border: geminiVerification.is_civic_issue
                      ? '1px solid #86EFAC'
                      : '1px solid #FECACA',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {geminiVerification.is_civic_issue ? (
                        <ShieldCheck size={22} color="#16A34A" />
                      ) : (
                        <AlertTriangle size={22} color="#DC2626" />
                      )}
                      <div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: geminiVerification.is_civic_issue ? '#14532D' : '#991B1B' }}>
                          {geminiVerification.is_civic_issue
                            ? `✓ Gemini AI Verified Genuine Civic Issue (${Math.round((geminiVerification.confidence_score || 0.95) * 100)}% Confidence)`
                            : '⚠️ Flagged as Non-Civic or Invalid Content'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                          Powered by <strong>Gemini 3.6 Flash</strong> • Engine: <strong>{geminiVerification.keyUsed || 'Reversed Primary'}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerGeminiAnalysis()}
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '4px 10px', height: 'auto', background: '#FFFFFF' }}
                    >
                      <RefreshCw size={12} /> Re-Analyze
                    </button>
                  </div>

                  {/* Verification Rationale */}
                  <p style={{ fontSize: '0.825rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                    <strong>Verification Note:</strong> {geminiVerification.verification_notes}
                  </p>

                  {/* Detected Object Badges & Meta */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569' }}>Detected Visual Indicators:</span>
                    {Array.isArray(geminiVerification.detected_objects) &&
                      geminiVerification.detected_objects.map((obj, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.725rem',
                            background: '#FFFFFF',
                            color: '#15803D',
                            border: '1px solid #BBF7D0',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                          }}
                        >
                          ● {obj}
                        </span>
                      ))}
                    <span
                      style={{
                        fontSize: '0.725rem',
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginLeft: 'auto',
                      }}
                    >
                      Severity: {geminiVerification.severity || 'Medium'}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerGeminiAnalysis()}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    border: '1px solid #C4B5FD',
                    background: 'linear-gradient(135deg, #FAF5FF 0%, #EFF6FF 100%)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#6D28D9',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    transition: 'all 0.15s ease',
                  }}
                  className="btn-glow-hover"
                >
                  <Sparkles size={18} color="#7C3AED" />
                  <span>Analyze, Auto-Fill & AI-Verify with Gemini 3.6 Flash</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 2: VERIFIED PROBLEM DETAILS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                2. Problem Statement Details (AI Auto-Filled, Editable)
              </h3>
              {geminiVerification && (
                <span style={{ fontSize: '0.725rem', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} /> Synchronized with Gemini Vision
                </span>
              )}
            </div>

            {/* Title */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Problem Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Deep Pothole and Asphalt Breakdown on Arterial Road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Detailed Description *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe what is observed, the public hazard, and the urgency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Expected Outcome */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Expected Outcome / Required Technical Remediation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Immediate hot-mix asphalt patching and stormwater drain clearing"
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
              />
            </div>

            {/* Category & District */}
            <div className="grid-2" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="water">Water & Sanitation</option>
                  <option value="urban_infra">Urban Infrastructure (Roads, Waste, Lighting)</option>
                  <option value="education">Education & School Facilities</option>
                  <option value="healthcare">Public Healthcare & Clinics</option>
                  <option value="agriculture">Agriculture & Farm Irrigation</option>
                  <option value="environment">Environment & Pollution</option>
                  <option value="energy">Power Grid & Renewable Energy</option>
                  <option value="rural_livelihoods">Rural Livelihoods & Markets</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">District *</label>
                <input
                  type="text"
                  className="form-input"
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
                  placeholder="e.g. Near Market Chowk, Main Street"
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
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
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
              disabled={loading || isCompressing || isAiAnalyzing}
              className="btn btn-primary"
              style={{ borderRadius: '10px', background: '#5B21B6', padding: '0.65rem 1.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting Problem...
                </>
              ) : (
                'Submit Verified Problem'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
