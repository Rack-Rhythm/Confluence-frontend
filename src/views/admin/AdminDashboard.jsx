import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Building2,
  School,
  TerminalSquare,
  Activity,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  ListChecks,
  Lightbulb,
  Sliders,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { StatCard } from '../../components/common/StatCard';

export const AdminDashboard = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [issuesCount, setIssuesCount] = useState(0);
  const [pitchesCount, setPitchesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      try {
        const [usersRes, unisRes, orgsRes, issuesRes, pitchesRes] = await Promise.allSettled([
          authAPI.getUsers(),
          authAPI.getUniversities(),
          authAPI.getOrganizations(),
          issuesAPI.getIssues(),
          pitchesAPI.getPitches(),
        ]);

        if (usersRes.status === 'fulfilled') {
          const list = Array.isArray(usersRes.value) ? usersRes.value : usersRes.value.results || [];
          setUsers(list);
        }
        if (unisRes.status === 'fulfilled') {
          const list = Array.isArray(unisRes.value) ? unisRes.value : unisRes.value.results || [];
          setUniversities(list);
        }
        if (orgsRes.status === 'fulfilled') {
          const list = Array.isArray(orgsRes.value) ? orgsRes.value : orgsRes.value.results || [];
          setOrganizations(list);
        }
        if (issuesRes.status === 'fulfilled') {
          const list = Array.isArray(issuesRes.value) ? issuesRes.value : issuesRes.value.results || [];
          setIssuesCount(list.length);
        }
        if (pitchesRes.status === 'fulfilled') {
          const list = Array.isArray(pitchesRes.value) ? pitchesRes.value : pitchesRes.value.results || [];
          setPitchesCount(list.length);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const handleNav = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '20px',
          padding: '1.75rem 2rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#EF4444', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
              ADMIN CONSOLE
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
              ● Cluster Healthy
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Platform Master Administration
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.35rem', maxWidth: '600px' }}>
            System-wide identity federation, university cell oversight, CSR partner accreditation, and security audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleNav('/admin/system-logs')}
            className="btn btn-outline"
            style={{ color: '#FFFFFF', borderColor: '#475569', borderRadius: '10px' }}
          >
            <TerminalSquare size={16} /> Audit Logs
          </button>
          <button
            onClick={() => handleNav('/admin/users')}
            className="btn btn-primary"
            style={{ background: '#2563EB', borderRadius: '10px' }}
          >
            <Users size={16} /> Manage Users
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid-responsive-4" style={{ gap: '1.25rem' }}>
        <StatCard
          icon={Users}
          title="Total Registered Users"
          value={users.length}
          subtext="Citizens, students, faculty, officials"
          color="#2563EB"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
          onClick={() => handleNav('/admin/users')}
        />
        <StatCard
          icon={School}
          title="Participating Universities"
          value={universities.length}
          subtext="State & central institutions"
          color="#8B5CF6"
          bgColor="#F5F3FF"
          borderColor="#DDD6FE"
          onClick={() => handleNav('/admin/organizations')}
        />
        <StatCard
          icon={Building2}
          title="Industry & CSR Partners"
          value={organizations.length}
          subtext="Active corporate foundations"
          color="#10B981"
          bgColor="#ECFDF5"
          borderColor="#A7F3D0"
          onClick={() => handleNav('/admin/organizations')}
        />
        <StatCard
          icon={Layers}
          title="Societal Problem Statement"
          value={issuesCount}
          subtext={`${pitchesCount} student solution pitches`}
          color="#F59E0B"
          bgColor="#FFFBEB"
          borderColor="#FDE68A"
        />
      </div>

      {/* 3. Operational Sections */}
      <div className="grid-responsive-2" style={{ gap: '1.5rem' }}>
        {/* Management Quick Links */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
            Administrative Control Panels
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* User Management */}
            <div
              onClick={() => handleNav('/admin/users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="btn-glow-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Users size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    User & Impersonation Management
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    1-click Login As any role, assign faculty/officers, reset passwords & permissions
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#94A3B8" />
            </div>

            {/* Problem & Challenge Management */}
            <div
              onClick={() => handleNav('/admin/problems')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="btn-glow-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                  <ListChecks size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    Challenges & Force Overrides
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    Force university adoption, override lifecycle states, edit parameters, purge records
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#94A3B8" />
            </div>

            {/* Solution Pitches & Confidential IP */}
            <div
              onClick={() => handleNav('/admin/pitches')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="btn-glow-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                  <Lightbulb size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    Student Solutions & IP Vault
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    Inspect unmasked confidential proposals, direct grant awards, repository audit
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#94A3B8" />
            </div>

            {/* Organizations & Universities */}
            <div
              onClick={() => handleNav('/admin/organizations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="btn-glow-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    Universities & Industry Accreditation
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    Full CRUD on higher-ed campuses, incubation cells, and corporate CSR partners
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#94A3B8" />
            </div>

            {/* Platform Master Settings */}
            <div
              onClick={() => handleNav('/admin/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="btn-glow-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                  <Sliders size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    Platform Master Settings & Policies
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    Emergency maintenance lock, AI confidence thresholds, broadcast announcements
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#94A3B8" />
            </div>

            {/* Audit Logs */}
            <div
              onClick={() => handleNav('/admin/system-logs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="btn-glow-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                  <TerminalSquare size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    Security & Audit Stream
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    Examine cryptographic pitch hashes, JWT sessions, and database mutations
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="#94A3B8" />
            </div>
          </div>
        </div>

        {/* System Health / Telemetry */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
            System Microservices
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { name: 'Django REST Gateway', status: 'Operational', latency: '4ms', icon: Activity, color: '#10B981' },
              { name: 'PostgreSQL Relational DB', status: 'Healthy (Pool 12/20)', latency: '2ms', icon: Database, color: '#10B981' },
              { name: 'AI NLP Triage Engine', status: 'Active (Multilingual)', latency: '350ms', icon: Cpu, color: '#2563EB' },
              { name: 'Prior-Art SHA-256 Hasher', status: 'Deterministic Online', latency: '<1ms', icon: CheckCircle2, color: '#10B981' },
            ].map((srv, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                  background: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <srv.icon size={18} color={srv.color} />
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>{srv.name}</div>
                    <div style={{ fontSize: '0.725rem', color: '#64748B' }}>Latency: {srv.latency}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: srv.color }}>
                  ● {srv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
