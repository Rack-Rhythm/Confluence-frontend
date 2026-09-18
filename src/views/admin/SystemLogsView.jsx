import React, { useState, useEffect } from 'react';
import { TerminalSquare, ShieldCheck, KeyRound, Database, Activity, RefreshCw } from 'lucide-react';
import { analyticsAPI } from '../../api/analytics';

export const SystemLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getAuditLogs();
      const rawLogs = Array.isArray(res) ? res : res.results || [];
      const liveLogs = rawLogs.map((n, idx) => ({
        id: n.id || idx,
        time: new Date(n.timestamp || n.created_at || Date.now()).toLocaleString(),
        event: n.action_detail || n.message || `${n.action || 'EVENT'}: ${n.target_type || ''} ${n.target_id || ''}`.trim(),
        ip: n.ip_address || '127.0.0.1 (API Gateway)',
        level: (n.level || n.action || 'AUDIT').toUpperCase(),
        actor: n.actor_email || n.user || 'System',
      }));
      setLogs(liveLogs);
    } catch (err) {
      console.warn('Could not fetch audit stream:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
            System Logs & Audit Trail
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Live administrative audit stream, security event tracking, and system telemetry.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
        >
          <RefreshCw size={15} /> Refresh Stream
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', background: '#0F172A', color: '#10B981', fontFamily: 'monospace', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TerminalSquare size={16} /> CONFLUENCE KERNEL AUDIT STREAM — PORT :8000
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto', color: '#2563EB' }} />
              <p>Streaming administrative audit records from server...</p>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>No audit events logged yet.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>System actions, authentication attempts, and model lifecycle events will stream here live.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem', fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>TIMESTAMP</th>
                  <th style={{ padding: '0.75rem 1rem' }}>EVENT</th>
                  <th style={{ padding: '0.75rem 1rem' }}>LEVEL</th>
                  <th style={{ padding: '0.75rem 1rem' }}>ACTOR</th>
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
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{log.actor}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94A3B8' }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
