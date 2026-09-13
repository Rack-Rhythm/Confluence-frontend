import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Calendar, Filter, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const ReportsDocuments = () => {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState('monthly_summary');
  const [timePeriod, setTimePeriod] = useState('3_months');
  const [format, setFormat] = useState('pdf');

  const handleGenerate = (e) => {
    e.preventDefault();
    showToast(`Generating ${reportType.replace('_', ' ')} in ${format.toUpperCase()} format...`, 'success');
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Reports & Documentation Center
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Generate, schedule, and export comprehensive civic and university progress audits.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
          Generate Custom Report
        </h3>

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <select
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="monthly_summary">Monthly Societal Challenge Summary</option>
              <option value="adoption_pipeline">University Adoption & Pitch Status Audit</option>
              <option value="project_progress">Project Deployment & Field Impact Report</option>
              <option value="district_breakdown">District-wise Infrastructure Gap Analysis</option>
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Time Period</label>
              <select
                className="form-select"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                <option value="1_month">Last 30 Days</option>
                <option value="3_months">Last 3 Months</option>
                <option value="6_months">Last 6 Months</option>
                <option value="1_year">Fiscal Year 2026</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Export Format</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['pdf', 'excel', 'csv'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: format === f ? '#2563EB' : '#F1F5F9',
                      color: format === f ? '#FFFFFF' : '#475569',
                      textTransform: 'uppercase',
                      border: 'none',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', borderRadius: '10px', marginTop: '1rem', background: '#2563EB' }}
          >
            <Download size={18} /> Generate & Download Report
          </button>
        </form>
      </div>
    </div>
  );
};
