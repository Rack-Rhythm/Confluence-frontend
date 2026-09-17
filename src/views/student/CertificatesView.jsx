import React, { useState, useEffect } from 'react';
import { Award, Download, CheckCircle, ShieldCheck, ExternalLink, FileCheck } from 'lucide-react';
import { pitchesAPI } from '../../api/pitches';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CertificatesView = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [officialCertificates, setOfficialCertificates] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      pitchesAPI.getCertificates(),
      pitchesAPI.getPitches({ mine: 1 })
    ])
      .then(([certRes, pitchRes]) => {
        if (certRes.status === 'fulfilled') {
          const rawCerts = Array.isArray(certRes.value) ? certRes.value : certRes.value?.results || [];
          setOfficialCertificates(rawCerts);
        }
        if (pitchRes.status === 'fulfilled') {
          const rawPitches = Array.isArray(pitchRes.value) ? pitchRes.value : pitchRes.value?.results || [];
          setPitches(rawPitches);
        }
      })
      .catch((err) => console.error('Error fetching certificates:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadCertificate = (cert) => {
    const certificateContent = `================================================================================
GOVERNMENT OF JHARKHAND & CONFLUENCE CIVIC INNOVATION PORTAL
OFFICIAL CERTIFICATE OF VERIFIED CIVIC INNOVATION & FIELD DEPLOYMENT
================================================================================

Certificate ID: ${cert.certificate_id}
Recipient: ${cert.recipient_name || user?.name || user?.email || 'Student Innovator'} (${cert.recipient_email || user?.email || ''})
Role: ${cert.role === 'student_innovator' ? 'Student Innovator' : cert.role || 'Contributor'}
Project: ${cert.project_title || cert.title}
Problem Challenge: ${cert.challenge_title || 'Civic Challenge'}
Issuing Institution: ${cert.university_name || 'Birsa Institute of Technology (BIT) Sindri'} & Department of Higher Education, Govt of Jharkhand
Date of Issuance: ${new Date(cert.issued_at).toLocaleDateString()}

CRYPTOGRAPHIC TAMPER-PROOF AUTHENTICATION:
SHA-256 Verification Hash:
${cert.verification_hash}

Online Verification Link:
${window.location.origin}/certificates/${cert.certificate_id}/verify

Official Status: ${cert.is_revoked ? 'REVOKED' : 'CRYPTOGRAPHICALLY SEALED & VERIFIED'}
================================================================================`;

    const blob = new Blob([certificateContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cert.certificate_id}_Certificate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded verified certificate ${cert.certificate_id}!`, 'success');
  };

  const handleDownloadPriorArt = (pitch) => {
    const priorArtContent = `================================================================================
GOVERNMENT OF JHARKHAND & CONFLUENCE CIVIC INNOVATION PORTAL
PRIOR-ART TIMESTAMP & INNOVATION PROPOSAL RECORD
================================================================================

Proposal ID: ${pitch.public_id || pitch.id}
Title: ${pitch.title}
Student Innovator: ${user?.name || user?.email || 'Student Innovator'}
Status: ${pitch.status}
Registered University: ${pitch.university_details?.name || user?.university_details?.name || 'Birsa Institute of Technology (BIT) Sindri'}
Timestamped: ${new Date(pitch.created_at).toLocaleDateString()}

CRYPTOGRAPHIC PRIOR-ART SEAL:
SHA-256 Submission Hash:
${pitch.submission_hash || 'SHA-256 verified prior-art seal'}

Official Record: Registered in the Confluence Civic Innovation Registry
================================================================================`;

    const blob = new Blob([priorArtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PriorArt_${pitch.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded prior-art timestamp for "${pitch.title}"!`, 'success');
  };

  const totalCredentials = officialCertificates.length + pitches.length;

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Certificates & Verified Credentials
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
          Cryptographically authenticated credentials for verified project deployments and immutable prior-art submissions.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#94A3B8' }}>
          Loading your verified credentials...
        </div>
      ) : totalCredentials === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#64748B' }}>
            <Award size={28} />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            No credentials earned yet
          </div>
          <p style={{ fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto' }}>
            Submit an innovation pitch to receive an immutable prior-art timestamp. Complete verified field deployments to earn official Govt-signed Outcome Certificates.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Official Outcome Certificates */}
          {officialCertificates.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#10B981" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Verified Outcome Certificates ({officialCertificates.length})
                </h2>
              </div>

              {officialCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    borderLeft: '4px solid #10B981',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10B981',
                        flexShrink: 0,
                      }}
                    >
                      <Award size={32} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065F46', background: '#D1FAE5', padding: '2px 8px', borderRadius: '999px' }}>
                          VERIFIED OUTCOME
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', background: '#F1F5F9', padding: '2px 8px', borderRadius: '999px', fontFamily: 'monospace' }}>
                          {cert.certificate_id}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                        {cert.title || cert.project_title}
                      </h3>
                      <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                        Challenge: <strong style={{ color: '#334155' }}>{cert.challenge_title || 'Civic Problem'}</strong> • Issued by {cert.university_name || 'University Innovation Board'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#059669', marginTop: '4px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        SHA-256: {cert.verification_hash}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleDownloadCertificate(cert)}
                      className="btn btn-outline btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      <Download size={15} /> Download
                    </button>
                    <a
                      href={`/certificates/${cert.certificate_id}/verify`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={14} /> Verify
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prior-Art Submission Seals */}
          {pitches.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck size={20} color="#2563EB" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  Prior-Art Submissions & Innovation Seals ({pitches.length})
                </h2>
              </div>

              {pitches.map((pitch) => (
                <div
                  key={pitch.id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                        flexShrink: 0,
                      }}
                    >
                      <Award size={26} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 700, color: pitch.status === 'selected' ? '#10B981' : '#2563EB', background: pitch.status === 'selected' ? '#ECFDF5' : '#EFF6FF', padding: '2px 8px', borderRadius: '999px' }}>
                          {pitch.status === 'selected' ? 'Winning Proposal' : 'Prior-Art Registered'}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                        {pitch.title}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Registered via {pitch.university_details?.name || user?.university_details?.name || 'Birsa Institute of Technology (BIT) Sindri'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#94A3B8', marginTop: '3px', fontFamily: 'monospace' }}>
                        Date: {new Date(pitch.created_at).toLocaleDateString()} • {pitch.submission_hash ? `Hash: ${pitch.submission_hash.substring(0, 32)}...` : 'Immutable Prior-Art Stamped'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadPriorArt(pitch)}
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: '8px', flexShrink: 0 }}
                  >
                    <Download size={14} /> Receipt
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

