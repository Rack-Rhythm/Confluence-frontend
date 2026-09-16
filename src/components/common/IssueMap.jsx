import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { StatusBadge } from './StatusBadge';

// Fix standard Leaflet default icon issues in bundlers
const getCategoryColor = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('infra') || cat.includes('road') || cat.includes('urban')) return '#EF4444'; // Red
  if (cat.includes('sanitat') || cat.includes('water') || cat.includes('waste')) return '#10B981'; // Green
  if (cat.includes('safe') || cat.includes('public') || cat.includes('admin') || cat.includes('light')) return '#3B82F6'; // Blue
  if (cat.includes('env') || cat.includes('forest') || cat.includes('energy') || cat.includes('tree')) return '#F59E0B'; // Orange
  if (cat.includes('trans') || cat.includes('bus') || cat.includes('traffic')) return '#8B5CF6'; // Purple
  return '#6366F1';
};

const createCustomIcon = (statusOrCategory, isCategory = false) => {
  let color = '#F59E0B';
  if (isCategory) {
    color = getCategoryColor(statusOrCategory);
  } else {
    if (statusOrCategory === 'validated' || statusOrCategory === 'adopted' || statusOrCategory === 'assigned' || statusOrCategory === 'in_progress') {
      color = '#2563EB';
    } else if (statusOrCategory === 'resolved' || statusOrCategory === 'selected' || statusOrCategory === 'completed') {
      color = '#10B981';
    } else if (statusOrCategory === 'rejected') {
      color = '#EF4444';
    }
  }

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="${color}">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

export const IssueMap = ({
  issues = [],
  onViewIssue,
  height = '340px',
  colorBy = 'status',
  showOverlayLegend = true,
}) => {
  // Center on first issue coordinates or default to Ranchi, Jharkhand region
  const validIssues = (issues || []).filter(
    (i) => i.latitude && i.longitude && !isNaN(parseFloat(i.latitude)) && !isNaN(parseFloat(i.longitude))
  );

  const defaultCenter = validIssues.length > 0
    ? [parseFloat(validIssues[0].latitude), parseFloat(validIssues[0].longitude)]
    : [23.3441, 85.3096]; // Ranchi / Jharkhand region

  return (
    <div
      style={{
        width: '100%',
        height: height,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        position: 'relative',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={validIssues.length > 0 ? 8 : 7}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validIssues.map((issue) => (
          <Marker
            key={issue.id}
            position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
            icon={createCustomIcon(
              colorBy === 'category' ? issue.category : issue.status,
              colorBy === 'category'
            )}
          >
            <Popup>
              <div style={{ padding: '4px', minWidth: '180px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <StatusBadge status={issue.status} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', marginBottom: '4px' }}>
                  {issue.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '8px' }}>
                  📍 {issue.district || 'Location'}
                </div>
                {onViewIssue && (
                  <button
                    onClick={() => onViewIssue(issue)}
                    style={{
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      width: '100%',
                    }}
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay at bottom left (only if enabled) */}
      {showOverlayLegend && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(6px)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            fontSize: '0.725rem',
            display: 'flex',
            gap: '12px',
            fontWeight: 600,
          }}
        >
          {colorBy === 'category' ? (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                Infrastructure
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                Sanitation
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
                Safety
              </span>
            </>
          ) : (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
                Under Review
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }}></span>
                In Progress
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                Resolved
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
