import React, { useState, useEffect } from 'react';
import { Building2, School, Plus, Globe, MapPin, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useToast } from '../../context/ToastContext';

export const OrganizationsManagement = () => {
  const { showToast } = useToast();
  const [universities, setUniversities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [uniRes, orgRes] = await Promise.allSettled([
          authAPI.getUniversities(),
          authAPI.getOrganizations(),
        ]);
        if (uniRes.status === 'fulfilled') setUniversities(uniRes.value);
        if (orgRes.status === 'fulfilled') setOrganizations(orgRes.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Organizations & Institutions
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Participating state universities, technical colleges, and industry CSR organizations.
        </p>
      </div>

      {/* Universities Section */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <School size={20} color="#2563EB" /> Participating Universities ({universities.length})
        </h2>

        <div className="grid-2">
          {universities.map((uni) => (
            <div key={uni.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    {uni.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '3px' }}>
                    Code: <strong>{uni.code || 'UNIV'}</strong> • District: <strong>{uni.district || 'State'}</strong>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                  ● Verified Campus
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Organizations Section */}
      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={20} color="#10B981" /> Industry & CSR Partners ({organizations.length})
        </h2>

        <div className="grid-2">
          {organizations.map((org) => (
            <div key={org.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    {org.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '3px' }}>
                    Type: <strong style={{ textTransform: 'uppercase' }}>{org.org_type || 'CSR'}</strong> • {org.website || 'Official Partner'}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>
                  ● Active MOU
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
