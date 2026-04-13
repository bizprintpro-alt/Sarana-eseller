// ══════════════════════════════════════════════════════════════
// Live Commerce — YouTube/Facebook embed utilities
// ══════════════════════════════════════════════════════════════

export type EmbedType = 'YOUTUBE' | 'FACEBOOK' | 'MUX' | 'CUSTOM'

export interface LiveStreamEmbed {
  youtubeUrl?: string | null
  facebookUrl?: string | null
  muxPlaybackId?: string | null
  embedType?: string | null
  thumbnailUrl?: string | null
  scheduledAt?: string | Date | null
}

/** YouTube URL → video ID */
export function parseYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/live\/([^?&#]+)/,
    /youtube\.com\/watch\?v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/** Facebook video URL → video ID */
export function parseFacebookVideoId(url: string): string | null {
  const match = url.match(/\/videos\/(\d+)/)
  return match ? match[1] : null
}

/** Get embeddable iframe URL for a stream */
export function getEmbedUrl(stream: LiveStreamEmbed): string | null {
  if (stream.youtubeUrl) {
    const id = parseYouTubeId(stream.youtubeUrl)
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`
  }
  if (stream.facebookUrl) {
    const encoded = encodeURIComponent(stream.facebookUrl)
    return `https://www.facebook.com/plugins/video.php?href=${encoded}&autoplay=true`
  }
  if (stream.muxPlaybackId) {
    return `https://stream.mux.com/${stream.muxPlaybackId}.m3u8`
  }
  return null
}

/** Get YouTube thumbnail URL from a stream */
export function getYouTubeThumbnail(stream: LiveStreamEmbed): string | null {
  if (stream.youtubeUrl) {
    const id = parseYouTubeId(stream.youtubeUrl)
    if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
  }
  return null
}

/** Get best available thumbnail for a stream */
export function getStreamThumbnail(stream: LiveStreamEmbed): string {
  const ytThumb = getYouTubeThumbnail(stream)
  if (ytThumb) return ytThumb
  if (stream.thumbnailUrl) return stream.thumbnailUrl
  return '/default-live.jpg'
}
