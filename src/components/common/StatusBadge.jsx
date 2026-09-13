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

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase().replace(' ', '_');

  const config = {
    submitted: { label: 'Under Review', class: 'badge-submitted', icon: Clock },
    under_review: { label: 'Under Review', class: 'badge-under_review', icon: Clock },
    validated: { label: 'Validated', class: 'badge-validated', icon: CheckCircle2 },
    adopted: { label: 'Adopted', class: 'badge-adopted', icon: Layers },
    assigned: { label: 'In Progress', class: 'badge-assigned', icon: PlayCircle },
    in_progress: { label: 'In Progress', class: 'badge-in_progress', icon: PlayCircle },
    selected: { label: 'Selected', class: 'badge-selected', icon: Award },
    resolved: { label: 'Resolved', class: 'badge-resolved', icon: CheckCircle2 },
    completed: { label: 'Completed', class: 'badge-completed', icon: CheckCircle2 },
    rejected: { label: 'Rejected', class: 'badge-rejected', icon: XCircle },
    declined: { label: 'Declined', class: 'badge-rejected', icon: XCircle },
    high_impact: { label: 'High Impact', class: 'badge-high_impact', icon: Sparkles },
    medium_impact: { label: 'Medium Impact', class: 'badge-medium_impact', icon: Sparkles },
  };

  const item = config[norm] || {
    label: status || 'Unknown',
    class: 'badge-submitted',
    icon: FileText,
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
