import * as Cesium from "cesium";
import * as turf from "@turf/turf";

function getRayPosition({ viewer, position }) {
  const ray = viewer.camera.getPickRay(position);
  const rayPosition = viewer.scene.globe.pick(ray, viewer.scene);

  return rayPosition;
}

function getCoordinate(position) {
  const cartographic = Cesium.Cartographic.fromCartesian(position);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);

  return [longitude, latitude];
}

function calculateRadius(startPosition, endPosition) {
  const startCartographic = Cesium.Cartographic.fromCartesian(startPosition);
  const endCartographic = Cesium.Cartographic.fromCartesian(endPosition);

  const ellipsoid = Cesium.Ellipsoid.WGS84;
  const geodesic = new Cesium.EllipsoidGeodesic(
    startCartographic,
    endCartographic,
    ellipsoid,
  );
  // 최대 반지름 3600km
  return Math.min(geodesic.surfaceDistance, 3600000);
}

function calculateDistance(positionArr) {
  const line = turf.lineString(positionArr);
  const distance = turf.lineDistance(line, { units: "kilometers" });

  return distance;
}

function calculateArea(positionArr) {
  const polygonFeature = turf.polygon([positionArr]);
  const area = turf.area(polygonFeature);

  return area;
}

export {
  getRayPosition,
  getCoordinate,
  calculateArea,
  calculateRadius,
  calculateDistance,
};
