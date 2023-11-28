export function distanceFormatter(distance) {
  if (distance > 1) return `${distance.toFixed(2)}km`;
  return `${(distance * 1000).toFixed(2)}m`;
}

export function detailDistanceFormatter(distance) {
  if (distance > 1) return `${distance.toFixed(4)}km`;
  return `${(distance * 1000).toFixed(4)}m`;
}
