import * as Cesium from "cesium";

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

export { getRayPosition, getCoordinate };
