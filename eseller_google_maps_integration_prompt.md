# Eseller.mn — Google Maps Байршил Шалгах API Интеграци
## Claude Code Prompt — Google Maps Integration

Дэлгүүрийн байршлыг Google Maps API ашиглан шалгах, баталгаажуулах,
geocode хийх бүрэн систем.

---

## 1. ENVIRONMENT VARIABLES

```bash
# .env.local
GOOGLE_MAPS_API_KEY=AIzaSy...          # Server-side (geocoding, places)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...  # Client-side (map display)

# Google Cloud Console-д идэвхжүүлэх API-ууд:
# - Maps JavaScript API       (map харуулах)
# - Geocoding API             (хаяг → координат)
# - Places API                (хайлт, autocomplete)
# - Maps Static API           (thumbnail зураг)
```

---

## 2. GOOGLE MAPS SERVICE — lib/maps/googleMaps.ts

```typescript
// lib/maps/googleMaps.ts

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
  placeId:     string
  description: string
  mainText:    string
  secondaryText: string
}

const GOOGLE_API_BASE = 'https://maps.googleapis.com/maps/api'
const API_KEY         = process.env.GOOGLE_MAPS_API_KEY!

// Монгол улсын хил
const MONGOLIA_BOUNDS = {
  latMin: 41.5, latMax: 52.2,
  lngMin: 87.7, lngMax: 119.9,
}

// ─── 1. Хаягаас координат авах (Geocoding) ────────────────
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    address:    `${address}, Улаанбаатар, Монгол`,
    region:     'MN',
    language:   'mn',
    key:        API_KEY,
    bounds:     '41.5,87.7|52.2,119.9',  // Монголын хилийн хүрээ
  })

  const res  = await fetch(`${GOOGLE_API_BASE}/geocode/json?${params}`)
  const data = await res.json()

  if (data.status !== 'OK' || !data.results?.length) {
    return null
  }

  const result   = data.results[0]
  const location = result.geometry.location
  const inMongolia = (
    location.lat >= MONGOLIA_BOUNDS.latMin &&
    location.lat <= MONGOLIA_BOUNDS.latMax &&
    location.lng >= MONGOLIA_BOUNDS.lngMin &&
    location.lng <= MONGOLIA_BOUNDS.lngMax
  )

  const accuracy     = result.geometry.location_type as GeocodeResult['accuracy']
  const confidence   = accuracy === 'ROOFTOP' ? 'high'
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

// ─── 3. Places Autocomplete ────────────────────────────────
export async function getPlaceSuggestions(
  input:     string,
  sessionToken: string
): Promise<PlaceSuggestion[]> {
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

  return data.predictions.map((p: any) => ({
    placeId:       p.place_id,
    description:   p.description,
    mainText:      p.structured_formatting.main_text,
    secondaryText: p.structured_formatting.secondary_text || '',
  }))
}

// ─── 4. Place Details (координат авах) ────────────────────
export async function getPlaceDetails(
  placeId:      string,
  sessionToken: string
): Promise<{ lat: number; lng: number; address: string } | null> {
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

// ─── 5. Static Map thumbnail URL ──────────────────────────
export function getStaticMapUrl(
  lat:  number,
  lng:  number,
  opts: { width?: number; height?: number; zoom?: number } = {}
): string {
  const { width = 400, height = 200, zoom = 15 } = opts
  const params = new URLSearchParams({
    center:  `${lat},${lng}`,
    zoom:    String(zoom),
    size:    `${width}x${height}`,
    markers: `color:red|${lat},${lng}`,
    key:     API_KEY,
    style:   'element:geometry|color:0x1a1a1a',
  })
  return `${GOOGLE_API_BASE}/staticmap?${params}`
}

// ─── 6. Хоёр байршлын зай тооцоолох (Haversine) ──────────
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
```

---

## 3. API ROUTES

```typescript
// app/api/maps/geocode/route.ts
// POST { address: string } → { lat, lng, ... }

import { geocodeAddress } from '@/lib/maps/googleMaps'
import { validateCoords  } from '@/lib/location/validateCoords'

export async function POST(req: Request) {
  const { address } = await req.json()
  if (!address?.trim()) {
    return Response.json({ error: 'Хаяг хоосон байна' }, { status: 400 })
  }

  const result = await geocodeAddress(address)
  if (!result) {
    return Response.json({ error: 'Хаяг олдсонгүй' }, { status: 404 })
  }

  // Координат шалгалт нэмэх
  const coordCheck = validateCoords(result.lat, result.lng)

  return Response.json({ ...result, coordCheck })
}

// app/api/maps/reverse/route.ts
// GET ?lat=47.8864&lng=106.9057 → { address }

import { reverseGeocode } from '@/lib/maps/googleMaps'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')

  if (isNaN(lat) || isNaN(lng)) {
    return Response.json({ error: 'Координат буруу' }, { status: 400 })
  }

  const address = await reverseGeocode(lat, lng)
  if (!address) {
    return Response.json({ error: 'Хаяг олдсонгүй' }, { status: 404 })
  }

  return Response.json({ address })
}

// app/api/maps/places/route.ts
// GET ?q=Зайсан&token=xxx → suggestions[]

import { getPlaceSuggestions } from '@/lib/maps/googleMaps'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q     = searchParams.get('q') || ''
  const token = searchParams.get('token') || ''

  if (q.length < 2) return Response.json({ suggestions: [] })

  const suggestions = await getPlaceSuggestions(q, token)
  return Response.json({ suggestions })
}

// app/api/maps/place-details/route.ts
// GET ?placeId=xxx&token=xxx

import { getPlaceDetails } from '@/lib/maps/googleMaps'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const placeId = searchParams.get('placeId') || ''
  const token   = searchParams.get('token') || ''

  const details = await getPlaceDetails(placeId, token)
  if (!details) {
    return Response.json({ error: 'Place олдсонгүй' }, { status: 404 })
  }

  return Response.json(details)
}

// app/api/seller/locations/[id]/verify/route.ts
// POST → хаягаар geocode хийж координат шинэчлэх

import { geocodeAddress } from '@/lib/maps/googleMaps'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session  = await requireAuth(req)
  const location = await db.storeLocation.findFirst({
    where: { id: params.id, entityId: await getActiveEntityId(session.user.id) }
  })
  if (!location) return new Response('Not found', { status: 404 })

  const fullAddress = `${location.district}, ${location.khoroo}, ${location.address}`
  const result      = await geocodeAddress(fullAddress)

  if (!result || !result.inMongolia) {
    return Response.json({ success: false, message: 'Хаяг олдсонгүй эсвэл Монголоос гадна' })
  }

  await db.storeLocation.update({
    where: { id: params.id },
    data: {
      lat:             result.lat,
      lng:             result.lng,
      coordStatus:     result.inMongolia ? 'valid_mongolia' : 'outside',
      coordNeedsUpdate:false,
      coordCheckedAt:  new Date(),
    }
  })

  return Response.json({
    success:       true,
    lat:           result.lat,
    lng:           result.lng,
    formattedAddr: result.formattedAddr,
    confidence:    result.confidence,
    message:       `Байршил олдлоо (${result.confidence === 'high' ? 'нарийн' : 'ойролцоо'})`,
  })
}
```

---

## 4. MAP PICKER COMPONENT — Google Maps ашигласан

```tsx
// components/seller/GoogleMapPicker.tsx
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { nanoid } from 'nanoid'

interface Props {
  lat:           number
  lng:           number
  onChange:      (lat: number, lng: number, address?: string) => void
  height?:       number
}

export function GoogleMapPicker({ lat, lng, onChange, height = 280 }: Props) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapObj    = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [loading, setLoading]   = useState(true)
  const [address, setAddress]   = useState('')
  const [searching, setSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [token, setToken] = useState(() => nanoid())

  // Load Google Maps script
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
    if ((window as any).google?.maps) { initMap(); return }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=mn`
    script.async = true
    script.onload = initMap
    document.head.appendChild(script)

    return () => { document.head.removeChild(script) }
  }, [])

  const initMap = useCallback(() => {
    if (!mapRef.current) return

    const map = new google.maps.Map(mapRef.current, {
      center:            { lat, lng },
      zoom:              15,
      mapTypeControl:    false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    })

    const marker = new google.maps.Marker({
      position:  { lat, lng },
      map,
      draggable: true,
      icon: {
        path:        google.maps.SymbolPath.CIRCLE,
        scale:       10,
        fillColor:   '#E8242C',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    })

    // Marker drag
    marker.addListener('dragend', async () => {
      const pos  = marker.getPosition()!
      const nlat = pos.lat()
      const nlng = pos.lng()
      onChange(nlat, nlng)
      // Reverse geocode
      const res = await fetch(`/api/maps/reverse?lat=${nlat}&lng=${nlng}`)
      const d   = await res.json()
      if (d.address) setAddress(d.address)
    })

    // Map click
    map.addListener('click', async (e: google.maps.MapMouseEvent) => {
      const nlat = e.latLng!.lat()
      const nlng = e.latLng!.lng()
      marker.setPosition({ lat: nlat, lng: nlng })
      onChange(nlat, nlng)
      const res = await fetch(`/api/maps/reverse?lat=${nlat}&lng=${nlng}`)
      const d   = await res.json()
      if (d.address) setAddress(d.address)
    })

    mapObj.current  = map
    markerRef.current = marker
    setLoading(false)
  }, [lat, lng, onChange])

  // Address search
  const handleSearch = useCallback(async (q: string) => {
    setAddress(q)
    if (q.length < 2) { setSuggestions([]); return }

    const res  = await fetch(`/api/maps/places?q=${encodeURIComponent(q)}&token=${token}`)
    const data = await res.json()
    setSuggestions(data.suggestions || [])
  }, [token])

  const selectSuggestion = useCallback(async (s: any) => {
    setSuggestions([])
    setSearching(true)

    const res  = await fetch(`/api/maps/place-details?placeId=${s.placeId}&token=${token}`)
    const data = await res.json()
    setToken(nanoid()) // New session token after selection

    if (data.lat && mapObj.current && markerRef.current) {
      const pos = { lat: data.lat, lng: data.lng }
      mapObj.current.panTo(pos)
      mapObj.current.setZoom(17)
      markerRef.current.setPosition(pos)
      onChange(data.lat, data.lng, data.address)
      setAddress(data.address)
    }
    setSearching(false)
  }, [token, onChange])

  // Auto-verify button
  const autoVerify = useCallback(async () => {
    setSearching(true)
    const res  = await fetch(`/api/maps/geocode`, {
      method: 'POST',
      body:   JSON.stringify({ address }),
      headers:{ 'Content-Type': 'application/json' },
    })
    const data = await res.json()

    if (data.lat && mapObj.current && markerRef.current) {
      const pos = { lat: data.lat, lng: data.lng }
      mapObj.current.panTo(pos)
      mapObj.current.setZoom(17)
      markerRef.current.setPosition(pos)
      onChange(data.lat, data.lng, data.formattedAddr)
    }
    setSearching(false)
  }, [address, onChange])

  return (
    <div style={{ position: 'relative' }}>
      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <div style={{
          display: 'flex', gap: 6,
          border: '0.5px solid var(--esl-border)',
          borderRadius: 'var(--esl-radius-md)',
          background: 'var(--esl-bg-input)',
          overflow: 'hidden',
        }}>
          <input
            value={address}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Хаяг хайх... жш: Зайсан Хилл, 2-р давхар"
            style={{
              flex: 1, padding: '8px 12px', border: 'none',
              background: 'transparent', outline: 'none',
              fontSize: 13, color: 'var(--esl-text-primary)',
            }}
          />
          <button onClick={autoVerify} disabled={searching || !address}
            style={{
              padding: '0 14px', border: 'none', cursor: 'pointer',
              background: '#E8242C', color: '#fff', fontSize: 12, fontWeight: 500,
              opacity: (!address || searching) ? 0.5 : 1,
            }}>
            {searching ? '...' : 'Хайх'}
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--esl-bg-card)',
            border: '0.5px solid var(--esl-border)',
            borderRadius: '0 0 var(--esl-radius-md) var(--esl-radius-md)',
            overflow: 'hidden',
          }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => selectSuggestion(s)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 12px', border: 'none', background: 'none',
                  cursor: 'pointer', borderBottom: '0.5px solid var(--esl-border)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--esl-bg-section)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <p style={{ fontSize: 13, color: 'var(--esl-text-primary)', margin: 0 }}>
                  {s.mainText}
                </p>
                <p style={{ fontSize: 11, color: 'var(--esl-text-muted)', margin: 0 }}>
                  {s.secondaryText}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden',
        border: '0.5px solid var(--esl-border)', height }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'var(--esl-bg-section)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: 'var(--esl-text-muted)',
          }}>
            Газрын зураг ачааллаж байна...
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Coord display */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {[
          { label: 'Өргөрөг (lat)', value: lat.toFixed(6) },
          { label: 'Уртраг (lng)',  value: lng.toFixed(6) },
        ].map(f => (
          <div key={f.label} style={{ flex: 1 }}>
            <p style={{ fontSize: 10, color: 'var(--esl-text-muted)', marginBottom: 3 }}>{f.label}</p>
            <div style={{
              padding: '6px 10px', border: '0.5px solid var(--esl-border)',
              borderRadius: 'var(--esl-radius-md)', background: 'var(--esl-bg-section)',
              fontFamily: 'monospace', fontSize: 12, color: 'var(--esl-text-primary)',
            }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 5. AUTO-VERIFY BUTTON — байршил засах хуудас дотор

```tsx
// components/seller/AutoVerifyButton.tsx
// Дэлгүүрийн хаягаар автомат geocode хийж координат авах

'use client'
import { useState } from 'react'

interface Props {
  locationId: string
  onVerified: (lat: number, lng: number, address: string) => void
}

export function AutoVerifyButton({ locationId, onVerified }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleVerify = async () => {
    setStatus('loading')
    const res  = await fetch(`/api/seller/locations/${locationId}/verify`, { method: 'POST' })
    const data = await res.json()

    if (data.success) {
      setStatus('success')
      setMessage(data.message)
      onVerified(data.lat, data.lng, data.formattedAddr)
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setMessage(data.message)
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div>
      <button onClick={handleVerify} disabled={status === 'loading'}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px',
          borderRadius: 'var(--esl-radius-md)',
          border: '0.5px solid rgba(59,130,246,0.3)',
          background: 'rgba(59,130,246,0.08)',
          color: status === 'success' ? '#22C55E'
               : status === 'error'   ? '#E8242C'
               : '#3B82F6',
          fontSize: 12, fontWeight: 500, cursor: 'pointer',
          opacity: status === 'loading' ? 0.6 : 1,
        }}>
        {status === 'loading' ? (
          <>
            <SpinnerIcon size={14} /> Хайж байна...
          </>
        ) : status === 'success' ? (
          <>
            <CheckIcon size={14} /> Олдлоо ✓
          </>
        ) : status === 'error' ? (
          <>
            <XIcon size={14} /> Олдсонгүй
          </>
        ) : (
          <>
            <MapPinIcon size={14} /> Хаягаар автомат тогтоох
          </>
        )}
      </button>

      {message && status !== 'idle' && (
        <p style={{
          fontSize: 11, marginTop: 5,
          color: status === 'success' ? 'var(--color-text-success)' : 'var(--color-text-danger)',
        }}>
          {message}
        </p>
      )}
    </div>
  )
}
```

---

## 6. ADMIN BULK GEOCODE — хаягаар бүгдийг автомат шинэчлэх

```typescript
// app/api/admin/locations/bulk-geocode/route.ts
// POST → координат байхгүй бүх байршлыг хаягаар geocode хийх

import { geocodeAddress } from '@/lib/maps/googleMaps'

export async function POST(req: Request) {
  requireAdmin(req)

  const locations = await db.storeLocation.findMany({
    where: { isActive: true, coordNeedsUpdate: true },
  })

  const results = { success: 0, failed: 0, skipped: 0 }

  for (const loc of locations) {
    // Rate limit: Google Geocoding API = 50 req/sec
    await sleep(25)

    const fullAddress = [loc.district, loc.khoroo, loc.address]
      .filter(Boolean).join(', ')

    const geo = await geocodeAddress(fullAddress)

    if (!geo || !geo.inMongolia) {
      results.failed++
      continue
    }

    await db.storeLocation.update({
      where: { id: loc.id },
      data: {
        lat:              geo.lat,
        lng:              geo.lng,
        coordStatus:      'valid_mongolia',
        coordNeedsUpdate: false,
        coordCheckedAt:   new Date(),
      }
    })

    results.success++
  }

  return Response.json({
    total:   locations.length,
    ...results,
    message: `${results.success} байршил шинэчлэгдлээ, ${results.failed} олдсонгүй`,
  })
}
```

---

## 7. ХЭРЭГЖИЛТИЙН ДАРААЛАЛ

```
1. Google Cloud Console тохируулах
   → Maps JavaScript API идэвхжүүлэх
   → Geocoding API идэвхжүүлэх
   → Places API идэвхжүүлэх
   → API key үүсгэж .env-д нэмэх

2. lib/maps/googleMaps.ts үүсгэх

3. API routes үүсгэх:
   → /api/maps/geocode
   → /api/maps/reverse
   → /api/maps/places
   → /api/maps/place-details
   → /api/seller/locations/[id]/verify

4. GoogleMapPicker component үүсгэж
   LocationFormPage-д Leaflet-ийн оронд солих

5. AutoVerifyButton байршил засах хуудсанд нэмэх

6. Admin bulk geocode:
   → /api/admin/locations/bulk-geocode
   → Admin dashboard-д "Бүгдийг автомат тогтоох" товч нэмэх

7. Cron шинэчлэлт:
   → check-locations cron-д verifyWithGoogle() нэмэх
```

---

## 8. GOOGLE CLOUD CONSOLE ТОХИРУУЛГА

```
1. console.cloud.google.com → Шинэ project үүсгэх: "eseller-maps"

2. APIs & Services → Enable APIs:
   ✓ Maps JavaScript API
   ✓ Geocoding API
   ✓ Places API (New)

3. Credentials → Create API Key
   → Application restrictions: HTTP referrers
   → Зөвшөөрөгдсөн domain: sarana-eseller.vercel.app/*
   → API restrictions: зөвхөн дээрх 3 API

4. Billing тохируулах (шаардлагатай)
   → $200/сар үнэгүй credit байна
   → Geocoding: $5 per 1000 request
   → Places: $17 per 1000 request

5. Budget alert: $10 дэвсэхэд мэдэгдэл тохируулах
```
