/**
 * Universal Notification URL Resolver
 * Translates database/backend notification URLs (e.g., /issues/5/, /pitches/2/, /engagements/)
 * into the exact registered React Router client routes based on the current user's role.
 */
export const resolveNotificationUrl = (url, role) => {
  const baseRole =
    role === 'faculty_mentor' || role === 'university_coordinator'
      ? 'university'
      : role === 'industry_partner'
      ? 'industry'
      : role === 'gov_admin'
      ? 'officer'
      : role || 'citizen';

  if (!url) {
    return `/${baseRole}/dashboard`;
  }

  const clean = String(url).trim();

  // If URL is already fully qualified with role prefix
  if (
    clean.startsWith('/university/') ||
    clean.startsWith('/student/') ||
    clean.startsWith('/industry/') ||
    clean.startsWith('/citizen/') ||
    clean.startsWith('/officer/') ||
    clean.startsWith('/admin/')
  ) {
    return clean;
  }

  // Handle issues / civic challenges: /issues/:id/
  const issueMatch = clean.match(/^\/?issues\/(\d+)\/?/);
  if (issueMatch) {
    const id = issueMatch[1];
    if (baseRole === 'student') return `/student/problems/${id}`;
    if (baseRole === 'university') return `/university/issues/${id}`;
    if (baseRole === 'industry') return `/industry/projects`;
    if (baseRole === 'officer') return `/officer/issues/${id}`;
    return `/citizen/issues/${id}`;
  }

  // Handle pitches: /pitches/:id/
  const pitchMatch = clean.match(/^\/?pitches\/(\d+)\/?/);
  if (pitchMatch) {
    const id = pitchMatch[1];
    if (baseRole === 'student') return `/student/pitches/${id}`;
    if (baseRole === 'university') return `/university/pitches/${id}`;
    if (baseRole === 'industry') return `/industry/pitches/${id}`;
    return `/citizen/my-feedback`;
  }

  // Handle projects: /projects/:id/ or /projects/
  const projMatch = clean.match(/^\/?projects(?:\/(\d+))?\/?/);
  if (projMatch) {
    const id = projMatch[1];
    if (baseRole === 'student') return id ? `/student/projects/${id}` : `/student/my-projects`;
    if (baseRole === 'university') return id ? `/university/projects/${id}` : `/university/projects`;
    if (baseRole === 'industry') return id ? `/industry/projects/${id}` : `/industry/projects`;
    if (baseRole === 'officer') return `/officer/projects`;
    return `/citizen/my-issues`;
  }

  // Handle engagements & partnerships
  if (clean.includes('engagement') || clean.includes('partnership')) {
    if (baseRole === 'university') return '/university/adopted-problems';
    if (baseRole === 'industry') return '/industry/engagements';
    if (baseRole === 'student') return '/student/opportunities';
    return `/${baseRole}/dashboard`;
  }

  // Handle mentorship
  if (clean.includes('mentor')) {
    if (baseRole === 'university') return '/university/mentorship';
    if (baseRole === 'student') return '/student/opportunities';
    return `/${baseRole}/dashboard`;
  }

  return clean.startsWith('/') ? clean : `/${clean}`;
};
