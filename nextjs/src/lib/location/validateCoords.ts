// lib/location/validateCoords.ts
// Координатын бүрэн шалгалт — Монгол улсын хилийн хүрээ + УБ хотын хүрээ

const MONGOLIA_BOUNDS = {
  latMin: 41.5, latMax: 52.2,
  lngMin: 87.7, lngMax: 119.9,
}

const UB_BOUNDS = {
  latMin: 47.7, latMax: 48.1,
  lngMin: 106.6, lngMax: 107.3,
}

export type CoordStatus =
  | 'valid_ub'
  | 'valid_mongolia'
  | 'outside'
  | 'zero'
  | 'missing'

export interface CoordValidation {
  status:      CoordStatus
  valid:       boolean
  message:     string
  needsUpdate: boolean
}

export function validateCoords(
  lat: number | null | undefined,
  lng: number | null | undefined
): CoordValidation {

  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return {
      status: 'missing', valid: false, needsUpdate: true,
      message: 'Байршлын координат оруулаагүй байна. Газрын зураг дээр pin тавина уу.',
    }
  }

  if (lat === 0 && lng === 0) {
    return {
      status: 'zero', valid: false, needsUpdate: true,
      message: 'Байршил тогтоогоогүй байна (0, 0). Газрын зурагт тэмдэглэнэ үү.',
    }
  }

  const inMongolia = (
    lat >= MONGOLIA_BOUNDS.latMin && lat <= MONGOLIA_BOUNDS.latMax &&
    lng >= MONGOLIA_BOUNDS.lngMin && lng <= MONGOLIA_BOUNDS.lngMax
  )
  if (!inMongolia) {
    return {
      status: 'outside', valid: false, needsUpdate: true,
      message: `Координат Монголоос гадна байна (${lat.toFixed(4)}, ${lng.toFixed(4)}). Шалгана уу.`,
    }
  }

  const inUB = (
    lat >= UB_BOUNDS.latMin && lat <= UB_BOUNDS.latMax &&
    lng >= UB_BOUNDS.lngMin && lng <= UB_BOUNDS.lngMax
  )

  return {
    status:      inUB ? 'valid_ub' : 'valid_mongolia',
    valid:       true,
    needsUpdate: false,
    message:     inUB ? 'Улаанбаатар хотод байна' : 'Монгол улсад байна',
  }
}

export function validateCoordsMany(
  locations: Array<{ id: string; name: string; lat: number | null; lng: number | null }>
) {
  return locations.map(loc => ({
    id: loc.id, name: loc.name,
    validation: validateCoords(loc.lat, loc.lng),
  }))
}

export function getCoordStats(
  locations: Array<{ lat: number | null; lng: number | null }>
) {
  const results = locations.map(l => validateCoords(l.lat, l.lng))
  return {
    total:       results.length,
    valid:       results.filter(r => r.valid).length,
    missing:     results.filter(r => r.status === 'missing').length,
    zero:        results.filter(r => r.status === 'zero').length,
    outside:     results.filter(r => r.status === 'outside').length,
    needsUpdate: results.filter(r => r.needsUpdate).length,
  }
}
