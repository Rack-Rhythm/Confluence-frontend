import React from 'react';
import { HelpCircle, BookOpen, MessageSquare, Bug, Phone, Mail, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const HelpSupport = () => {
  const { showToast } = useToast();

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
          Help & Technical Support
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Find answers, review platform workflows, and contact the state technical coordination team.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        <div
          className="card"
          style={{ padding: '1.5rem', cursor: 'pointer' }}
          onClick={() => showToast('Opening State Innovation User Guide...', 'info')}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', marginBottom: '1rem' }}>
            <BookOpen size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            User Guide & SOPs
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5 }}>
            Step-by-step instructions on issue triage, review board merge operations, and dual-package IP.
          </p>
        </div>

        <div
          className="card"
          style={{ padding: '1.5rem', cursor: 'pointer' }}
          onClick={() => showToast('Opening FAQs directory...', 'info')}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: '1rem' }}>
            <HelpCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            Frequently Asked Questions
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5 }}>
            Common questions regarding university adoption deadlines, CSR grants, and IP protection.
          </p>
        </div>

        <div
          className="card"
          style={{ padding: '1.5rem', cursor: 'pointer' }}
          onClick={() => showToast('Connecting to State Tech Support desk...', 'info')}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', marginBottom: '1rem' }}>
            <Phone size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            Contact Support Desk
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5 }}>
            Direct helpline for university coordinators and government admins: support@confluence.gov.in
          </p>
        </div>

        <div
          className="card"
          style={{ padding: '1.5rem', cursor: 'pointer' }}
          onClick={() => showToast('Report a bug form opened.', 'info')}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', marginBottom: '1rem' }}>
            <Bug size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
            Report a System Bug
          </h3>
          <p style={{ fontSize: '0.825rem', color: '#64748B', lineHeight: 1.5 }}>
            Submit bug tickets directly to the Confluence engineering team with diagnostics.
          </p>
        </div>
      </div>
    </div>
  );
};
