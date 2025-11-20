export function nowIso() {
  return new Date().toISOString()
}
export function elapsedSeconds(startIso, endIso) {
  if (!startIso || !endIso) return 0
  const a = new Date(startIso).getTime()
  const b = new Date(endIso).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Number(((b - a) / 1000).toFixed(2))
}