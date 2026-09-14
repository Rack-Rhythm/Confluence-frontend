import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Shield, Mail, Phone, School, Building2 } from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useToast } from '../../context/ToastContext';

export const UserManagement = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getUsers();
        const list = Array.isArray(res) ? res : res.results || [];
        setUsersList(list);
      } catch (err) {
        console.error('Failed to fetch live users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const tabs = [
    { id: 'all', label: `All Users (${usersList.length})` },
    { id: 'citizen', label: `Citizens (${usersList.filter((u) => u.role === 'citizen').length})` },
    { id: 'student', label: `Students (${usersList.filter((u) => u.role === 'student').length})` },
    { id: 'university', label: `University Staff (${usersList.filter((u) => u.role.includes('coordinator') || u.role.includes('mentor')).length})` },
    { id: 'government', label: `Government (${usersList.filter((u) => u.role === 'gov_admin').length})` },
    { id: 'industry', label: `Industry (${usersList.filter((u) => u.role === 'industry_partner').length})` },
  ];

  const filtered = usersList.filter((u) => {
    if (activeTab === 'citizen') return u.role === 'citizen';
    if (activeTab === 'student') return u.role === 'student';
    if (activeTab === 'university') return u.role.includes('coordinator') || u.role.includes('mentor');
    if (activeTab === 'government') return u.role === 'gov_admin';
    if (activeTab === 'industry') return u.role === 'industry_partner';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          User Management & Access Control
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Manage user accounts, institutional affiliations, roles, and administrative permissions.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#FFFFFF', padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: activeTab === t.id ? '#0F172A' : '#F1F5F9',
              color: activeTab === t.id ? '#FFFFFF' : '#475569',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}># USER</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>EMAIL</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>ROLE</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>AFFILIATION</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0F172A' }}>
                    {u.name}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#475569' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '999px', textTransform: 'capitalize' }}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>
                    {u.university_details?.name || u.organization_details?.name || u.university || u.organization || 'General Public'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                      ● Active Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
