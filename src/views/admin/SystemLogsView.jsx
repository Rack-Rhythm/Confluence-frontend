import React from 'react';
import { TerminalSquare, ShieldCheck, KeyRound, Database, Activity } from 'lucide-react';

export const SystemLogsView = () => {
  const logs = [
    { id: 1, time: '2026-09-14 01:22:15', event: 'JWT Token Issued: student1@bitsindri.ac.in', ip: '127.0.0.1', level: 'INFO' },
    { id: 2, time: '2026-09-14 01:22:18', event: 'Issue #1 Adopted: Birsa Institute of Technology (BIT) Sindri', ip: '127.0.0.1', level: 'AUDIT' },
    { id: 3, time: '2026-09-14 01:23:40', event: 'Pitch #1 Submitted: SHA-256 Prior-Art Hash Stamped', ip: '127.0.0.1', level: 'CRYPTO' },
    { id: 4, time: '2026-09-14 01:25:02', event: 'AI Triage Service Response: Confidence 0.94, Category: water', ip: '127.0.0.1', level: 'AI_INFERENCE' },
    { id: 5, time: '2026-09-14 01:27:10', event: 'Project Lifecycle Milestone 1 Updated: Architecture Freeze', ip: '127.0.0.1', level: 'LIFECYCLE' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          System Logs & Audit Trail
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Real-time security logs, cryptographic timestamps, and administrative audit trails.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', background: '#0F172A', color: '#10B981', fontFamily: 'monospace', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TerminalSquare size={16} /> CONFLUENCE KERNEL AUDIT STREAM — PORT :8000
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem', fontFamily: 'monospace' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '0.75rem 1rem' }}>TIMESTAMP</th>
                <th style={{ padding: '0.75rem 1rem' }}>EVENT</th>
                <th style={{ padding: '0.75rem 1rem' }}>LEVEL</th>
                <th style={{ padding: '0.75rem 1rem' }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>{log.time}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0F172A' }}>{log.event}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#EFF6FF', color: '#2563EB', fontSize: '0.7rem' }}>
                      {log.level}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94A3B8' }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
