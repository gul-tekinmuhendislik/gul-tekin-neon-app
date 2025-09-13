export function normalizeSlug(slug: string): string {
  // Map of Turkish characters to their ASCII equivalents
  const turkishMap: { [key: string]: string } = {
    'ç': 'c',
    'Ç': 'c',
    'ğ': 'g',
    'Ğ': 'g',
    'ı': 'i',
    'İ': 'i',
    'ö': 'o',
    'Ö': 'o',
    'ş': 's',
    'Ş': 's',
    'ü': 'u',
    'Ü': 'u'
  };

  // Replace Turkish characters with ASCII equivalents
  let normalized = slug;
  for (const [turkish, ascii] of Object.entries(turkishMap)) {
    normalized = normalized.replace(new RegExp(turkish, 'g'), ascii);
  }

  return normalized.toLowerCase();
}

export function decodeAndNormalizeSlug(encodedSlug: string): string {
  try {
    // First decode the URL-encoded string
    const decoded = decodeURIComponent(encodedSlug);
    // Then normalize it
    return decoded;
  } catch {
    // If decoding fails, return the original slug
    return encodedSlug;
  }
}