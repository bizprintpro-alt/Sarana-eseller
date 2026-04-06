/**
 * Location utilities — eseller.mn
 * Haversine distance + UB district detection
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/** UB 9 дүүргийн төв координат */
export const UB_DISTRICTS: Record<string, Coordinates & { label: string }> = {
  'khan-uul':          { lat: 47.8864, lng: 106.9057, label: 'Хан-Уул' },
  'sukhbaatar':        { lat: 47.9138, lng: 106.9220, label: 'Сүхбаатар' },
  'bayangol':          { lat: 47.9057, lng: 106.8832, label: 'Баянгол' },
  'bayanzurkh':        { lat: 47.9284, lng: 107.0127, label: 'Баянзүрх' },
  'chingeltei':        { lat: 47.9289, lng: 106.9377, label: 'Чингэлтэй' },
  'songinokhairkhan':  { lat: 47.8964, lng: 106.7747, label: 'Сонгинохайрхан' },
  'nalaikh':           { lat: 47.7568, lng: 107.3140, label: 'Налайх' },
  'baganuur':          { lat: 47.7102, lng: 108.2793, label: 'Багануур' },
  'bagakhangai':       { lat: 47.6368, lng: 106.9690, label: 'Багахангай' },
};

/** Short label mapping for backward compat */
export const DISTRICT_SHORT_MAP: Record<string, string> = {
  'ХУД': 'khan-uul', 'СБД': 'sukhbaatar', 'БГД': 'bayangol',
  'БЗД': 'bayanzurkh', 'ЧД': 'chingeltei', 'СХД': 'songinokhairkhan',
  'НД': 'nalaikh', 'БНД': 'baganuur',
};

/**
 * Haversine distance between two points (km)
 */
export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Detect user's district from GPS coordinates
 */
export function getUserDistrict(lat: number, lng: number): { key: string; label: string; distance: number } {
  const userCoords: Coordinates = { lat, lng };
  let nearest = { key: 'khan-uul', label: 'Хан-Уул', distance: Infinity };

  for (const [key, district] of Object.entries(UB_DISTRICTS)) {
    const dist = haversineDistance(userCoords, district);
    if (dist < nearest.distance) {
      nearest = { key, label: district.label, distance: dist };
    }
  }

  return nearest;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 0.1) return `${Math.round(km * 1000)}м`;
  if (km < 1) return `${Math.round(km * 100) * 10}м`;
  if (km < 10) return `${km.toFixed(1)}км`;
  return `${Math.round(km)}км`;
}

/**
 * Sort items by distance from user (for server-side)
 */
export function sortByDistance<T extends { lat?: number | null; lng?: number | null }>(
  items: T[],
  userCoords: Coordinates,
): (T & { distance: number })[] {
  return items
    .map(item => ({
      ...item,
      distance: item.lat && item.lng
        ? haversineDistance(userCoords, { lat: item.lat, lng: item.lng })
        : 9999,
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter items within radius
 */
export function filterByRadius<T extends { lat?: number | null; lng?: number | null }>(
  items: T[],
  userCoords: Coordinates,
  radiusKm: number = 5,
): (T & { distance: number })[] {
  return sortByDistance(items, userCoords).filter(item => item.distance <= radiusKm);
}
