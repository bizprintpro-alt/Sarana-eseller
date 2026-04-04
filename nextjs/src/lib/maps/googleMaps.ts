// lib/maps/googleMaps.ts
// Google Maps API — geocoding, reverse geocoding, places, static map, distance

export interface GeocodeResult {
  lat:           number
  lng:           number
  formattedAddr: string
  placeId:       string
  accuracy:      'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE'
  inMongolia:    boolean
  confidence:    'high' | 'medium' | 'low'
}

export interface PlaceSuggestion {
  placeId:       string
  description:   string
  mainText:      string
  secondaryText: string
}

const GOOGLE_API_BASE = 'https://maps.googleapis.com/maps/api'
const API_KEY         = process.env.GOOGLE_MAPS_API_KEY || ''

const MONGOLIA_BOUNDS = {
  latMin: 41.5, latMax: 52.2,
  lngMin: 87.7, lngMax: 119.9,
}

// ─── 1. Хаягаас координат авах (Geocoding) ────────────────
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!API_KEY) return null

  const params = new URLSearchParams({
    address:  `${address}, Улаанбаатар, Монгол`,
    region:   'MN',
    language: 'mn',
    key:      API_KEY,
    bounds:   '41.5,87.7|52.2,119.9',
  })

  const res  = await fetch(`${GOOGLE_API_BASE}/geocode/json?${params}`)
  const data = await res.json()

  if (data.status !== 'OK' || !data.results?.length) return null

  const result   = data.results[0]
  const location = result.geometry.location
  const inMongolia = (
    location.lat >= MONGOLIA_BOUNDS.latMin &&
    location.lat <= MONGOLIA_BOUNDS.latMax &&
    location.lng >= MONGOLIA_BOUNDS.lngMin &&
    location.lng <= MONGOLIA_BOUNDS.lngMax
  )

  const accuracy   = result.geometry.location_type as GeocodeResult['accuracy']
  const confidence = accuracy === 'ROOFTOP' ? 'high'
                   : accuracy === 'RANGE_INTERPOLATED' ? 'medium'
                   : 'low'

  return {
    lat:           location.lat,
    lng:           location.lng,
    formattedAddr: result.formatted_address,
    placeId:       result.place_id,
    accuracy,
    inMongolia,
    confidence,
  }
}

// ─── 2. Координатаас хаяг авах (Reverse Geocoding) ────────
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!API_KEY) return null

  const params = new URLSearchParams({
    latlng:   `${lat},${lng}`,
    language: 'mn',
    key:      API_KEY,
  })

  const res  = await fetch(`${GOOGLE_API_BASE}/geocode/json?${params}`)
  const data = await res.json()

  if (data.status !== 'OK' || !data.results?.length) return null
  return data.results[0].formatted_address
}

// ─── 3. Places Autocomplete ──────────────────────────────
export async function getPlaceSuggestions(
  input: string,
  sessionToken: string
): Promise<PlaceSuggestion[]> {
  if (!API_KEY) return []

  const params = new URLSearchParams({
    input,
    sessiontoken: sessionToken,
    language:     'mn',
    components:   'country:mn',
    key:          API_KEY,
  })

  const res  = await fetch(`${GOOGLE_API_BASE}/place/autocomplete/json?${params}`)
  const data = await res.json()

  if (data.status !== 'OK') return []

  return data.predictions.map((p: Record<string, unknown>) => ({
    placeId:       p.place_id,
    description:   p.description,
    mainText:      (p.structured_formatting as Record<string, string>)?.main_text || '',
    secondaryText: (p.structured_formatting as Record<string, string>)?.secondary_text || '',
  }))
}

// ─── 4. Place Details (координат авах) ───────────────────
export async function getPlaceDetails(
  placeId: string,
  sessionToken: string
): Promise<{ lat: number; lng: number; address: string } | null> {
  if (!API_KEY) return null

  const params = new URLSearchParams({
    place_id:     placeId,
    fields:       'geometry,formatted_address',
    sessiontoken: sessionToken,
    language:     'mn',
    key:          API_KEY,
  })

  const res  = await fetch(`${GOOGLE_API_BASE}/place/details/json?${params}`)
  const data = await res.json()

  if (data.status !== 'OK') return null

  const loc = data.result.geometry.location
  return {
    lat:     loc.lat,
    lng:     loc.lng,
    address: data.result.formatted_address,
  }
}

// ─── 5. Static Map thumbnail URL ─────────────────────────
export function getStaticMapUrl(
  lat: number,
  lng: number,
  opts: { width?: number; height?: number; zoom?: number } = {}
): string {
  const { width = 400, height = 200, zoom = 15 } = opts
  const params = new URLSearchParams({
    center:  `${lat},${lng}`,
    zoom:    String(zoom),
    size:    `${width}x${height}`,
    markers: `color:red|${lat},${lng}`,
    key:     API_KEY,
  })
  return `${GOOGLE_API_BASE}/staticmap?${params}`
}

// ─── 6. Хоёр байршлын зай тооцоолох (Haversine) ─────────
export function getDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R    = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
