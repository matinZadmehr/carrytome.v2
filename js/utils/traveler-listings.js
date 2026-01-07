const STORAGE_KEY = 'traveler_listings';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function extractAirportCode(text) {
  if (typeof text !== 'string') return null;
  const paren = text.match(/\(([A-Z]{3})\)/);
  if (paren) return paren[1];
  const any = text.match(/\b[A-Z]{3}\b/);
  return any ? any[0] : null;
}

export function getTravelerListings() {
  const list = readJson(STORAGE_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function addTravelerListing(listing) {
  const existing = getTravelerListings();
  const id = listing?.id || crypto.randomUUID();

  const normalized = {
    id,
    createdAt: new Date().toISOString(),
    origin: listing?.origin || '',
    destination: listing?.destination || '',
    originCode: listing?.originCode || extractAirportCode(listing?.origin) || '',
    destinationCode: listing?.destinationCode || extractAirportCode(listing?.destination) || '',
    dateISO: listing?.dateISO || null,
    time: listing?.time || null,
    duration: listing?.duration || null,
    capacityLabel: listing?.capacityLabel || 'فضای کافی',
    profileImage: listing?.profileImage || 'asset/images/logo.jpg',
    rating: listing?.rating ?? 4.8,
    completedDeliveries: listing?.completedDeliveries ?? 0,
    verified: listing?.verified ?? true,
  };

  const dedupeKey = `${normalized.originCode}|${normalized.destinationCode}|${normalized.dateISO || ''}|${normalized.time || ''}`;
  const withoutDuplicate = existing.filter((item) => {
    const key = `${item?.originCode || ''}|${item?.destinationCode || ''}|${item?.dateISO || ''}|${item?.time || ''}`;
    return key !== dedupeKey;
  });

  withoutDuplicate.unshift(normalized);
  writeJson(STORAGE_KEY, withoutDuplicate);
  window.dispatchEvent(new CustomEvent('traveler-listings-updated'));
  return normalized;
}

