export function distanceFormatter(distance, fixedNumber) {
  if (distance > 1) return `${distance.toFixed(fixedNumber)}km`;
  return `${(distance * 1000).toFixed(fixedNumber)}m`;
}

export function radiusFormatter(radius, fixedNumber) {
  if (radius >= 1000) {
    return `${(radius / 1000).toFixed(fixedNumber)}km`;
  } else {
    return `${radius.toFixed(fixedNumber)}m`;
  }
}
