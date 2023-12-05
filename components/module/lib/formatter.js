export function formatByKilo(distance, fixedNumber) {
  if (distance > 1) return `${distance.toFixed(fixedNumber)}km`;
  return `${(distance * 1000).toFixed(fixedNumber)}m`;
}

export function formatByMeter(radius, fixedNumber) {
  if (radius >= 1000) {
    return `${(radius / 1000).toFixed(fixedNumber)}km`;
  } else {
    return `${radius.toFixed(fixedNumber)}m`;
  }
}

export function areaFormatter(area, fixedNumber) {
  if (area >= 1000000) {
    const areaInSquareKilometers = area / 1000000;
    return areaInSquareKilometers.toFixed(fixedNumber) + "km²";
  } else {
    return area.toFixed(fixedNumber) + "m²";
  }
}
