import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const UniversityReports = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('problems'); // problems, projects, impact
  const [startDate, setStartDate] = useState('2024-08-01');
  const [endDate, setEndDate] = useState('2024-08-31');

  const recentReports = [
    { title: 'Monthly Innovation Pipeline Progress Report', date: '31 Aug 2024', format: 'PDF', size: '2.4 MB' },
    { title: 'Projects Field Impact & Prototype Metric Report', date: '28 Aug 2024', format: 'Excel', size: '1.2 MB' },
    { title: 'Adopted Problems & Student IP Summary', date: '25 Aug 2024', format: 'PDF', size: '3.1 MB' },
  ];

  const handleGenerate = (e) => {
    e.preventDefault();
    addToast(`Generated ${activeTab.toUpperCase()} report from ${startDate} to ${endDate}!`, 'success');
  };

  const handleDownload = (report) => {
    addToast(`Downloading ${report.title} (${report.format})...`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
          Reports
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
          Generate and download institutional progress, research output, and civic impact dossiers.
        </p>
      </div>

      {/* 2. Tabs Row */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '0.5rem',
        }}
      >
        {[
          { id: 'problems', label: 'Problem Reports' },
          { id: 'projects', label: 'Project Reports' },
          { id: 'impact', label: 'Impact Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 0',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              fontWeight: activeTab === tab.id ? 800 : 600,
              fontSize: '0.9rem',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Date Range & Generate Form */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                style={{ height: '42px', fontSize: '0.875rem' }}
              />
            </div>
            <span style={{ color: '#94A3B8', fontWeight: 700 }}>➔</span>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
                style={{ height: '42px', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-blue" style={{ height: '42px', borderRadius: '10px' }}>
            Generate Report
          </button>
        </form>
      </div>

      {/* 4. Recent Reports Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
            Recent Generated Reports
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.85rem 1.5rem' }}>Report Title</th>
              <th style={{ padding: '0.85rem 1.5rem' }}>Date Generated</th>
              <th style={{ padding: '0.85rem 1.5rem' }}>Format</th>
              <th style={{ padding: '0.85rem 1.5rem', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map((r, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }} className="table-row-hover">
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} color="#2563EB" />
                    <div>
                      <div style={{ fontWeight: 800, color: '#0F172A' }}>{r.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{r.size}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: '#64748B' }}>{r.date}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: r.format === 'PDF' ? '#FEF2F2' : '#F0FDF4',
                      color: r.format === 'PDF' ? '#DC2626' : '#16A34A',
                    }}
                  >
                    {r.format}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDownload(r)}
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={14} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
