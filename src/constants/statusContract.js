/**
 * Authoritative Frontend/Backend Status Contract (Section 45 & Issue 45)
 * Defines the canonical lifecycle states, flows, and display metadata for:
 * 1. Challenges (Issues)
 * 2. Solutions (Pitches)
 * 3. Projects & Milestones
 * 4. Open Calls & Adoptions
 * 5. Challenge Collaborator Roles
 * 6. Discussion Topics
 */

export const CHALLENGE_STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  VALIDATING: 'validating',
  VALIDATED: 'validated',
  ADOPTED: 'adopted',
  ASSIGNED: 'assigned',
  DEPLOYED: 'deployed',
  AWAITING_VERIFICATION: 'awaiting_verification',
  RESOLVED: 'resolved',
  REOPENED: 'reopened',
  REJECTED: 'rejected',
  DUPLICATE: 'duplicate',
});

export const SOLUTION_STATUS = Object.freeze({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CHANGES_REQUESTED: 'changes_requested',
  RESUBMITTED: 'resubmitted',
  SELECTED: 'selected',
  REJECTED: 'rejected',
  MERGED: 'merged',
});

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
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested',
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
  // Challenge states
  submitted: { label: 'Under Moderation', variant: 'warning', tone: 'amber' },
  validating: { label: 'Under Moderation', variant: 'warning', tone: 'amber' },
  validated: { label: 'Validated & Open', variant: 'success', tone: 'emerald' },
  adopted: { label: 'Adopted by University', variant: 'primary', tone: 'blue' },
  assigned: { label: 'Team Assigned', variant: 'primary', tone: 'blue' },
  deployed: { label: 'Deployed in Field', variant: 'primary', tone: 'indigo' },
  awaiting_verification: { label: 'Awaiting Citizen Verification', variant: 'warning', tone: 'orange' },
  resolved: { label: 'Citizen Verified & Resolved', variant: 'success', tone: 'green' },
  reopened: { label: 'Citizen Reopened', variant: 'danger', tone: 'rose' },
  rejected: { label: 'Rejected', variant: 'danger', tone: 'rose' },
  duplicate: { label: 'Duplicate', variant: 'neutral', tone: 'slate' },

  // Solution / Pitch states
  under_review: { label: 'Under Evaluation', variant: 'warning', tone: 'amber' },
  changes_requested: { label: 'Changes Requested', variant: 'danger', tone: 'rose' },
  resubmitted: { label: 'Resubmitted (Revised)', variant: 'primary', tone: 'blue' },
  selected: { label: 'Selected Solution', variant: 'success', tone: 'green' },
  merged: { label: 'Merged with Partner Team', variant: 'primary', tone: 'purple' },

  // Project states
  created: { label: 'Project Initialized', variant: 'neutral', tone: 'slate' },
  planning: { label: 'Planning & Specs', variant: 'primary', tone: 'blue' },
  prototype: { label: 'Hardware/Software Prototype', variant: 'primary', tone: 'blue' },
  pilot: { label: 'Field Pilot Testing', variant: 'primary', tone: 'indigo' },
  deployment_ready: { label: 'Deployment Ready (Gate Open)', variant: 'warning', tone: 'amber' },
  awaiting_citizen_verification: { label: 'Awaiting Citizen Gate', variant: 'warning', tone: 'orange' },
  verified: { label: 'Field Verified & Resolved', variant: 'success', tone: 'green' },
  closed: { label: 'Closed / Archived', variant: 'neutral', tone: 'slate' },
};

export const getStatusMeta = (status) => {
  const key = String(status || '').toLowerCase().replace(/[\s-]/g, '_');
  return STATUS_META[key] || {
    label: (status || 'Unknown').replace(/_/g, ' '),
    variant: 'neutral',
    tone: 'slate',
  };
};
