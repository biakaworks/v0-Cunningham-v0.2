/**
 * Parse GPS coordinates from various formats
 * Supports: "lat, lng", "lat,lng", "lat / lng"
 */
export function parseGpsCoords(gpsString: string | null | undefined): [number, number] | null {
  if (!gpsString) return null
  
  // Try common separators
  const separators = [',', '/', ';']
  
  for (const sep of separators) {
    if (gpsString.includes(sep)) {
      const parts = gpsString.split(sep).map(s => s.trim())
      if (parts.length === 2) {
        const lat = parseFloat(parts[0])
        const lng = parseFloat(parts[1])
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng]
        }
      }
    }
  }
  
  // Try space-separated
  const spaceParts = gpsString.trim().split(/\s+/)
  if (spaceParts.length === 2) {
    const lat = parseFloat(spaceParts[0])
    const lng = parseFloat(spaceParts[1])
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng]
    }
  }
  
  return null
}

/**
 * Format coordinates for display
 */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

/**
 * Check if coordinates are within continental US bounds
 */
export function isValidUSCoords(lat: number, lng: number): boolean {
  return lat >= 24 && lat <= 50 && lng >= -125 && lng <= -66
}
