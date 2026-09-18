/**
 * Authoritative Frontend/Backend Status Contract
 * Exactly matches Django Model TextChoices:
 * 1. Issue.Status (Challenge)
 * 2. Pitch.Status (Solution)
 * 3. Project.Status
 * 4. ProjectMilestone.Status
 * 5. Adoption.Status
 * 6. Deployment.Status
 * 7. CitizenVerification.Result
 * 8. Challenge Collaborator Roles & Discussion Categories
 */

export const ISSUE_STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  VALIDATING: 'validating',
  VALIDATED: 'validated',
  AVAILABLE_FOR_ADOPTION: 'available_for_adoption',
  ADOPTION_REQUESTED: 'adoption_requested',
  ADOPTED: 'adopted',
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  SOLUTION_SELECTED: 'solution_selected',
  ASSIGNED: 'assigned',
  PROJECT: 'project',
  PROTOTYPE: 'prototype',
  PILOT: 'pilot',
  DEPLOYED: 'deployed',
  AWAITING_CITIZEN_VERIFICATION: 'awaiting_citizen_verification',
  AWAITING_VERIFICATION: 'awaiting_verification',
  VERIFIED: 'verified',
  FAILED: 'failed',
  RESOLVED: 'resolved',
  REOPENED: 'reopened',
  REJECTED: 'rejected',
  DUPLICATE: 'duplicate',
});

// Alias for domain consistency
export const CHALLENGE_STATUS = ISSUE_STATUS;

export const PITCH_STATUS = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CHANGES_REQUESTED: 'changes_requested',
  RESUBMITTED: 'resubmitted',
  SELECTED: 'selected',
  REJECTED: 'rejected',
  MERGED: 'merged',
  PROJECT: 'project',
});

// Alias for domain consistency
export const SOLUTION_STATUS = PITCH_STATUS;

export const PROJECT_STATUS = Object.freeze({
  CREATED: 'created',
  PLANNING: 'planning',
  PROTOTYPE: 'prototype',
  PILOT: 'pilot',
  DEPLOYMENT_READY: 'deployment_ready',
  DEPLOYED: 'deployed',
  AWAITING_CITIZEN_VERIFICATION: 'awaiting_citizen_verification',
  VERIFIED: 'verified',
  REOPENED: 'reopened',
  CLOSED: 'closed',
});

export const PROJECT_MILESTONE_STATUS = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  OVERDUE: 'overdue',
});

export const MILESTONE_STATUS = PROJECT_MILESTONE_STATUS;

export const ADOPTION_STATUS = Object.freeze({
  APPROVED: 'approved',
  REQUESTED: 'requested',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
});

export const DEPLOYMENT_STATUS = Object.freeze({
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

export const CITIZEN_VERIFICATION_RESULT = Object.freeze({
  VERIFIED: 'verified',
  NOT_RESOLVED: 'not_resolved',
});

export const COLLABORATOR_ROLES = Object.freeze({
  MAINTAINER: 'maintainer',
  COORDINATOR: 'coordinator',
  FACULTY: 'faculty',
  STUDENT_CONTRIBUTOR: 'student_contributor',
  GOVERNMENT: 'government',
  INDUSTRY_PARTNER: 'industry_partner',
  CITIZEN_CONTRIBUTOR: 'citizen_contributor',
});

export const SOLUTION_TEAM_ROLES = Object.freeze({
  OWNER: 'owner',
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  RESEARCHER: 'researcher',
  OTHER: 'other',
});

export const DISCUSSION_TOPICS = Object.freeze({
  CHALLENGE: [
    { id: 'clarification', label: 'Problem Clarification' },
    { id: 'context', label: 'Citizen Context' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'constraints', label: 'Constraints & Safety' },
    { id: 'evidence', label: 'Field Evidence' },
    { id: 'general', label: 'General Discussion' },
  ],
  SOLUTION: [
    { id: 'technical', label: 'Technical Implementation' },
    { id: 'review', label: 'Review Feedback' },
    { id: 'implementation', label: 'Architecture & Stack' },
    { id: 'changes', label: 'Requested Changes' },
    { id: 'mentorship', label: 'Faculty Guidance' },
    { id: 'general', label: 'General Technical' },
  ],
  PROJECT: [
    { id: 'engineering', label: 'Engineering & Build' },
    { id: 'milestone', label: 'Milestone Deliverable' },
    { id: 'coordination', label: 'Team & Mentor Coordination' },
    { id: 'general', label: 'Project General' },
  ],
});

/**
 * Status presentation configuration used by badges and status indicators
 */
export const STATUS_META = {
  // Challenge / Issue states
  submitted: { label: 'Under Moderation', variant: 'warning', tone: 'amber' },
  validating: { label: 'Under Moderation', variant: 'warning', tone: 'amber' },
  validated: { label: 'Validated & Published', variant: 'success', tone: 'emerald' },
  available_for_adoption: { label: 'Available for Adoption', variant: 'primary', tone: 'blue' },
  adoption_requested: { label: 'Adoption Requested', variant: 'warning', tone: 'amber' },
  adopted: { label: 'Adopted by University', variant: 'primary', tone: 'blue' },
  open: { label: 'Open for Solutions', variant: 'success', tone: 'emerald' },
  assigned: { label: 'Team Assigned', variant: 'primary', tone: 'blue' },
  project: { label: 'Project Active', variant: 'primary', tone: 'indigo' },
  prototype: { label: 'Prototype Stage', variant: 'primary', tone: 'blue' },
  pilot: { label: 'Pilot in Field', variant: 'primary', tone: 'indigo' },
  deployed: { label: 'Deployed in Field', variant: 'primary', tone: 'indigo' },
  awaiting_verification: { label: 'Awaiting Citizen Gate', variant: 'warning', tone: 'orange' },
  awaiting_citizen_verification: { label: 'Awaiting Citizen Gate', variant: 'warning', tone: 'orange' },
  verified: { label: 'Citizen Verified', variant: 'success', tone: 'green' },
  failed: { label: 'Verification Failed', variant: 'danger', tone: 'rose' },
  resolved: { label: 'Resolved & Tracked', variant: 'success', tone: 'green' },
  reopened: { label: 'Reopened by Citizen', variant: 'danger', tone: 'rose' },
  rejected: { label: 'Rejected', variant: 'danger', tone: 'rose' },
  duplicate: { label: 'Duplicate', variant: 'neutral', tone: 'slate' },

  // Solution / Pitch states
  draft: { label: 'Draft', variant: 'neutral', tone: 'slate' },
  under_review: { label: 'Under Evaluation', variant: 'warning', tone: 'amber' },
  changes_requested: { label: 'Changes Requested', variant: 'danger', tone: 'rose' },
  resubmitted: { label: 'Resubmitted (Revised)', variant: 'primary', tone: 'blue' },
  selected: { label: 'Selected Solution', variant: 'success', tone: 'green' },
  merged: { label: 'Merged with Partner Team', variant: 'primary', tone: 'purple' },

  // Project states
  created: { label: 'Project Initialized', variant: 'neutral', tone: 'slate' },
  planning: { label: 'Planning & Specs', variant: 'primary', tone: 'blue' },
  deployment_ready: { label: 'Deployment Ready (Gate Open)', variant: 'warning', tone: 'amber' },
  closed: { label: 'Closed / Archived', variant: 'neutral', tone: 'slate' },

  // Milestone states
  pending: { label: 'Pending', variant: 'neutral', tone: 'slate' },
  in_progress: { label: 'In Progress', variant: 'primary', tone: 'blue' },
  approved: { label: 'Approved', variant: 'success', tone: 'green' },
  overdue: { label: 'Overdue', variant: 'danger', tone: 'rose' },

  // Adoption states
  requested: { label: 'Requested', variant: 'warning', tone: 'amber' },
  cancelled: { label: 'Cancelled', variant: 'neutral', tone: 'slate' },

  // Deployment states
  planned: { label: 'Deployment Planned', variant: 'neutral', tone: 'slate' },
  completed: { label: 'Deployment Completed', variant: 'success', tone: 'green' },
  not_resolved: { label: 'Not Resolved', variant: 'danger', tone: 'rose' },
};

export const getStatusMeta = (status) => {
  const key = String(status || '').toLowerCase().replace(/[\s-]/g, '_');
  return STATUS_META[key] || {
    label: (status || 'Unknown').replace(/_/g, ' '),
    variant: 'neutral',
    tone: 'slate',
  };
};
