/**
 * Centralized image resolution and fallback utility for Confluence.
 * Ensures 100% robust image loading for reported citizen problems, student solutions,
 * open calls, and industry partnerships without relying on fragile external CDNs.
 */

// Helper to generate elegant, self-contained SVG Data-URIs for categories
const createCategorySvg = (title, color1, color2, iconPath) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="500" fill="url(#bg)"/>
    <rect width="800" height="500" fill="url(#grid)"/>
    <circle cx="400" cy="185" r="75" fill="rgba(255,255,255,0.12)"/>
    <g transform="translate(365, 150) scale(3)" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconPath}
    </g>
    <text x="400" y="325" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" letter-spacing="1.5">${title.toUpperCase()}</text>
    <text x="400" y="360" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" letter-spacing="2">CONFLUENCE CIVIC PIPELINE</text>
    <rect x="300" y="395" width="200" height="32" rx="16" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
    <text x="400" y="416" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1">VERIFIED FIELD REPORT</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// High-fidelity fallback SVG graphics for each key sector
export const CATEGORY_FALLBACK_IMAGES = {
  water: createCategorySvg(
    'Water & Sanitation',
    '#0369A1',
    '#0284C7',
    '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>'
  ),
  agriculture: createCategorySvg(
    'Agriculture & Cold Storage',
    '#15803D',
    '#16A34A',
    '<path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12a10 10 0 0 1 10-10z"/><path d="M12 6v12"/><path d="M8 10c2-1 4-1 4 2"/><path d="M16 10c-2-1-4-1-4 2"/>'
  ),
  education: createCategorySvg(
    'Education & Literacy',
    '#6D28D9',
    '#7C3AED',
    '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'
  ),
  urban_infra: createCategorySvg(
    'Urban Infrastructure',
    '#1E293B',
    '#334155',
    '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="15" y2="18"/>'
  ),
  environment: createCategorySvg(
    'Mining & Environment',
    '#0F766E',
    '#0D9488',
    '<path d="M8 18a4 4 0 0 0 8 0"/><path d="M12 2v12"/><path d="M18.36 5.64a9 9 0 1 1-12.73 0"/>'
  ),
  healthcare: createCategorySvg(
    'Healthcare & Hygiene',
    '#BE123C',
    '#E11D48',
    '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
  ),
  energy: createCategorySvg(
    'Renewable Energy & Grid',
    '#D97706',
    '#F59E0B',
    '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
  ),
  transport: createCategorySvg(
    'Transport & Rural Roads',
    '#0284C7',
    '#38BDF8',
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15h10"/><path d="M9 9h6"/>'
  ),
  rural_livelihoods: createCategorySvg(
    'Rural Livelihoods & Craft',
    '#B45309',
    '#D97706',
    '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
  ),
};

export const DEFAULT_FALLBACK_IMAGE = createCategorySvg(
  'Civic Problem Pipeline',
  '#1E293B',
  '#0F172A',
  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
);

// High-resolution local hero assets for Projects and Partnerships
export const PROJECT_FALLBACK_IMAGE = '/confluence/world/03-innovate.jpg';
export const PARTNERSHIP_FALLBACK_IMAGE = '/confluence/world/04-partner.jpg';
export const VALIDATION_FALLBACK_IMAGE = '/confluence/world/02-validate.jpg';

export const getCategoryFallbackImage = (category) => {
  if (!category) return DEFAULT_FALLBACK_IMAGE;
  const key = String(category).toLowerCase().trim().replace(/ /g, '_');
  return CATEGORY_FALLBACK_IMAGES[key] || DEFAULT_FALLBACK_IMAGE;
};

/**
 * Returns the best candidate URL for an issue's photo.
 * Priority:
 * 1. issue.photo (actual uploaded photographic evidence file from citizen)
 *    Normalizes backend host variations (127.0.0.1:8000 -> /media) to leverage Vite proxy.
 * 2. issue.photo_url (web link provided during reporting)
 * 3. Thematic category fallback graphic
 */
export const getIssueImageUrl = (item) => {
  if (!item) return DEFAULT_FALLBACK_IMAGE;

  // 1. If string is passed directly
  if (typeof item === 'string') {
    let str = item.trim();
    if (str.includes('/media/')) {
      const idx = str.indexOf('/media/');
      return str.substring(idx);
    }
    if (str.startsWith('media/')) return `/${str}`;
    if (str.startsWith('issues/')) return `/media/${str}`;
    if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) return str;
    return `/${str}`;
  }

  // 2. Discover image candidate across direct and nested issue relationships
  const candidate =
    item.photo ||
    item.photo_url ||
    item.issue_photo ||
    item.issue_photo_url ||
    item.issue_details?.photo ||
    item.issue_details?.photo_url ||
    item.challenge_details?.photo ||
    item.challenge_details?.photo_url ||
    item.solution_details?.photo ||
    item.solution_details?.photo_url ||
    (item.issue && typeof item.issue === 'object' ? item.issue.photo || item.issue.photo_url : null) ||
    (item.challenge && typeof item.challenge === 'object' ? item.challenge.photo || item.challenge.photo_url : null);

  if (candidate && typeof candidate === 'string' && candidate.trim()) {
    let p = candidate.trim();
    // Normalize localhost / 127.0.0.1 backend URLs to relative /media/ for Vite proxy
    if (p.includes('/media/')) {
      const idx = p.indexOf('/media/');
      return p.substring(idx);
    }
    if (p.startsWith('media/')) {
      return `/${p}`;
    }
    if (p.startsWith('issues/')) {
      return `/media/${p}`;
    }
    if (p.startsWith('http://') || p.startsWith('https://')) {
      return p;
    }
    return p.startsWith('/') ? p : `/${p}`;
  }

  // 3. Category Fallback
  const cat =
    item.category ||
    item.issue_details?.category ||
    item.challenge_details?.category ||
    (item.issue && typeof item.issue === 'object' ? item.issue.category : null) ||
    (item.challenge && typeof item.challenge === 'object' ? item.challenge.category : null);

  return getCategoryFallbackImage(cat);
};

/**
 * Image error handler that gracefully recovers broken URLs (such as blocked CDNs, 404s,
 * or network timeouts) by seamlessly falling back to a guaranteed-to-render category graphic.
 */
export const handleImageError = (e, category) => {
  if (!e?.currentTarget) return;
  const fallback = getCategoryFallbackImage(category);
  if (e.currentTarget.src !== fallback) {
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src = fallback;
  }
};

