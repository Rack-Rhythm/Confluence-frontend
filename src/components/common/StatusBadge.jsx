import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  PlayCircle,
  XCircle,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

import { getStatusMeta } from '../../constants/statusContract';

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase().replace(/[\s-]/g, '_');
  const meta = getStatusMeta(norm);

  const config = {
    submitted: { label: 'Under Review', class: 'badge-submitted', icon: Clock },
    under_review: { label: 'Under Review', class: 'badge-under_review', icon: Clock },
    validating: { label: 'Under Moderation', class: 'badge-under_review', icon: Clock },
    validated: { label: 'Validated', class: 'badge-validated', icon: CheckCircle2 },
    adopted: { label: 'Adopted', class: 'badge-adopted', icon: Layers },
    assigned: { label: 'In Progress', class: 'badge-assigned', icon: PlayCircle },
    in_progress: { label: 'In Progress', class: 'badge-in_progress', icon: PlayCircle },
    requested: { label: 'Proposal Requested', class: 'badge-submitted', icon: Clock },
    accepted: { label: 'Accepted / MOU', class: 'badge-validated', icon: CheckCircle2 },
    active: { label: 'Active Collaboration', class: 'badge-assigned', icon: PlayCircle },
    deployed: { label: 'Deployed in Field', class: 'badge-completed', icon: CheckCircle2 },
    deployment_ready: { label: 'Deployment Ready', class: 'badge-submitted', icon: Clock },
    awaiting_verification: { label: 'Awaiting Citizen Verification', class: 'badge-under_review', icon: Clock },
    awaiting_citizen_verification: { label: 'Awaiting Citizen Verification', class: 'badge-under_review', icon: Clock },
    changes_requested: { label: 'Changes Requested', class: 'badge-rejected', icon: AlertCircle },
    resubmitted: { label: 'Resubmitted (Revised)', class: 'badge-submitted', icon: Clock },
    shortlisted: { label: 'Under Review', class: 'badge-under_review', icon: Clock },
    selected: { label: 'Selected', class: 'badge-selected', icon: Award },
    verified: { label: 'Citizen Verified', class: 'badge-resolved', icon: CheckCircle2 },
    resolved: { label: 'Resolved', class: 'badge-resolved', icon: CheckCircle2 },
    reopened: { label: 'Reopened', class: 'badge-rejected', icon: AlertCircle },
    completed: { label: 'Completed', class: 'badge-completed', icon: CheckCircle2 },
    rejected: { label: 'Rejected', class: 'badge-rejected', icon: XCircle },
    duplicate: { label: 'Duplicate', class: 'badge-rejected', icon: AlertCircle },
    declined: { label: 'Declined', class: 'badge-rejected', icon: XCircle },
    merged: { label: 'Merged with Partner Team', class: 'badge-adopted', icon: Layers },
    high_impact: { label: 'High Impact', class: 'badge-high_impact', icon: Sparkles },
    medium_impact: { label: 'Medium Impact', class: 'badge-medium_impact', icon: Sparkles },
  };

  const item = config[norm] || {
    label: meta.label,
    class: meta.variant === 'danger' ? 'badge-rejected' : meta.variant === 'success' ? 'badge-resolved' : 'badge-submitted',
    icon: meta.variant === 'success' ? CheckCircle2 : meta.variant === 'danger' ? AlertCircle : FileText,
  };
  const Icon = item.icon;

  return (
    <span className={`badge ${item.class}`}>
      <Icon size={12} />
      {item.label}
    </span>
  );
};

export const CategoryPill = ({ category, showIcon = true }) => {
  const cat = (category || '').toLowerCase();

  const labels = {
    water: 'Water & Sanitation',
    environment: 'Environment',
    agriculture: 'Agriculture',
    education: 'Education',
    healthcare: 'Healthcare',
    urban_infra: 'Infrastructure',
    energy: 'Energy',
    transport: 'Transport',
    public_admin: 'Public Safety',
    accessibility: 'Accessibility',
    rural_livelihoods: 'Rural Services',
    other: 'General',
  };

  return (
    <span className="category-pill">
      {labels[cat] || category || 'General'}
    </span>
  );
};
