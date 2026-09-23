// Map + directions links for a business location. Exact coordinates win; then
// the map search text; then the street address.
function destination(settings) {
  const { latitude, longitude, map_query, address } = settings ?? {}
  if (latitude != null && longitude != null && latitude !== '' && longitude !== '') {
    return `${Number(latitude)},${Number(longitude)}`
  }
  return map_query || address || ''
}

export function mapEmbedUrl(settings) {
  const dest = destination(settings)
  return dest ? `https://www.google.com/maps?q=${encodeURIComponent(dest)}&z=18&output=embed` : ''
}

// Opens Google Maps (app on phones) with turn-by-turn directions to the shop.
export function directionsUrl(settings) {
  const dest = destination(settings)
  return dest ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}` : ''
}
