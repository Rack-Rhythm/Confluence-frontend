/**
 * Centralized image resolution and fallback utility for Confluence.
 * Ensures robust image loading for reported citizen problems, student solutions, and open calls.
 */

export const CATEGORY_FALLBACK_IMAGES = {
  water: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
  agriculture: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
  education: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
  urban_infra: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
  environment: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
  healthcare: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
  energy: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  transport: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80',
  rural_livelihoods: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80',
};

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80';

export const getCategoryFallbackImage = (category) => {
  if (!category) return DEFAULT_FALLBACK_IMAGE;
  const key = String(category).toLowerCase().trim().replace(/ /g, '_');
  return CATEGORY_FALLBACK_IMAGES[key] || DEFAULT_FALLBACK_IMAGE;
};

/**
 * Returns the best candidate URL for an issue's photo.
 * Priority:
 * 1. issue.photo (actual uploaded photographic evidence file from citizen)
 * 2. issue.photo_url (web link provided during reporting)
 * 3. Thematic category fallback photo
 */
export const getIssueImageUrl = (issue) => {
  if (!issue) return DEFAULT_FALLBACK_IMAGE;

  // 1. Check uploaded photo (Django ImageField)
  if (issue.photo && typeof issue.photo === 'string' && issue.photo.trim()) {
    const p = issue.photo.trim();
    if (p.startsWith('http://') || p.startsWith('https://')) {
      return p;
    }
    if (p.startsWith('/media/')) {
      return p;
    }
    if (p.startsWith('media/')) {
      return `/${p}`;
    }
    if (p.startsWith('issues/')) {
      return `/media/${p}`;
    }
    return p.startsWith('/') ? p : `/${p}`;
  }

  // 2. Check external photo_url
  if (issue.photo_url && typeof issue.photo_url === 'string' && issue.photo_url.trim()) {
    const pu = issue.photo_url.trim();
    if (pu.startsWith('http://') || pu.startsWith('https://')) {
      return pu;
    }
    if (pu.startsWith('/media/')) {
      return pu;
    }
  }

  // 3. Category Fallback
  return getCategoryFallbackImage(issue.category);
};

/**
 * Image error handler that gracefully recovers broken URLs (like 404s, invalid web pages, hotlink blocks)
 * by seamlessly falling back to the thematic category image.
 */
export const handleImageError = (e, category) => {
  const fallback = getCategoryFallbackImage(category);
  if (e?.currentTarget && e.currentTarget.src !== fallback) {
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src = fallback;
  }
};
