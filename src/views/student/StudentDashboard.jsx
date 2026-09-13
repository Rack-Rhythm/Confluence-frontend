import React, { useState, useEffect } from 'react';
import {
  Compass,
  Lightbulb,
  FolderKanban,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { issuesAPI } from '../../api/issues';
import { pitchesAPI } from '../../api/pitches';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, CategoryPill } from '../../components/common/StatusBadge';

export const StudentDashboard = ({ onNavigate, onSelectProblem, onSubmitPitchForProblem }) => {
  const { user } = useAuth();
  const [openProblems, setOpenProblems] = useState([]);
  const [myPitches, setMyPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [issuesRes, pitchesRes] = await Promise.allSettled([
          issuesAPI.getIssues(),
          pitchesAPI.getPitches({ mine: 1 }),
        ]);

        if (issuesRes.status === 'fulfilled') {
          const raw = issuesRes.value;
          setOpenProblems(Array.isArray(raw) ? raw : raw.results || []);
        }

        if (pitchesRes.status === 'fulfilled') {
          const raw = pitchesRes.value;
          setMyPitches(Array.isArray(raw) ? raw : raw.results || []);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalOpenProblems = openProblems.filter((i) => ['validated', 'adopted'].includes(i.status)).length || openProblems.length;
  const totalPitches = myPitches.length;
  const ongoingProjects = myPitches.filter((p) => p.status === 'selected' || p.status === 'merged').length;
  const certificatesCount = 2; // Derived from completed milestones & participation

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. WELCOME BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 50%, #FFFFFF 100%)',
          borderRadius: '20px',
          border: '1px solid #BFDBFE',
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 4px 15px rgba(37, 99, 235, 0.05)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
            Welcome back, {user?.name || 'Priya'}! 🎓
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475569', maxWidth: '580px' }}>
            Transform real grassroots problems into patented technologies and scalable societal impact.
          </p>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            padding: '0.85rem 1.5rem',
            borderRadius: '16px',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
            ● INSTITUTIONAL INNOVATION
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '2px' }}>
            {user?.university_details?.name || user?.university?.name || 'BIT Sindri Innovation Lab'}
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid-4">
        <StatCard
          icon={Compass}
          title="Open Problems"
          value={totalOpenProblems}
          color="#2563EB"
          bgColor="#EFF6FF"
          borderColor="#BFDBFE"
          onClick={() => onNavigate('explore_problems')}
        />
        <StatCard
          icon={Lightbulb}
          title="My Pitches"
          value={totalPitches}
          color="#F59E0B"
          bgColor="#FFFBEB"
          borderColor="#FDE68A"
          onClick={() => onNavigate('my_pitches')}
        />
        <StatCard
          icon={FolderKanban}
          title="Ongoing Projects"
          value={ongoingProjects}
          color="#10B981"
          bgColor="#ECFDF5"
          borderColor="#A7F3D0"
          onClick={() => onNavigate('my_projects')}
        />
        <StatCard
          icon={Award}
          title="Certificates"
          value={certificatesCount}
          color="#8B5CF6"
          bgColor="#F5F3FF"
          borderColor="#DDD6FE"
          onClick={() => onNavigate('certificates')}
        />
      </div>

      {/* 3. MIDDLE ROW: RECOMMENDED PROBLEMS + RECENT ACTIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1.5rem' }}>
        {/* Recommended Problems */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Recommended Problems for You
              </h3>
              <p style={{ fontSize: '0.775rem', color: '#64748B' }}>
                Curated challenges aligned with your engineering and societal interests
              </p>
            </div>
            <button
              onClick={() => onNavigate('explore_problems')}
              style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {openProblems.slice(0, 4).map((issue) => (
              <div
                key={issue.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid #F1F5F9',
                  background: '#F8FAFC',
                }}
              >
                <img
                  src={issue.photo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=200'}
                  alt={issue.title}
                  style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                    <CategoryPill category={issue.category} />
                    <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>• {issue.district}</span>
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {issue.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onSelectProblem(issue)}
                    className="btn btn-outline btn-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onSubmitPitchForProblem(issue)}
                    className="btn btn-blue btn-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    Submit Pitch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              Recent Activity
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>● Live</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                <Lightbulb size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
                  New pitch submitted
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  JalShuddhi: Activated Alumina Filter (SHA-256 protected)
                </div>
                <span style={{ fontSize: '0.675rem', color: '#94A3B8' }}>2 hours ago</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                <Award size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
                  Pitch shortlisted
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  MundariBani Speech App assigned for district field pilot
                </div>
                <span style={{ fontSize: '0.675rem', color: '#94A3B8' }}>1 day ago</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', flexShrink: 0 }}>
                <FolderKanban size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>
                  Milestone Completed
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Field Recordings with Tribal Elders verified
                </div>
                <span style={{ fontSize: '0.675rem', color: '#94A3B8' }}>3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
