import * as Cesium from "cesium";

function addModelEntity({ viewer, position, orientation = [], modelInfo }) {
  // entity position
  const [longitude, latitude, height] = position;

  const cartesianPosition = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    height,
  );

  // entity orientation
  const [heading = 0, pitch = 0, roll = 0] = orientation;

  const transformedOrientation = Cesium.Transforms.headingPitchRollQuaternion(
    cartesianPosition,
    new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(heading),
      Cesium.Math.toRadians(pitch),
      Cesium.Math.toRadians(roll),
    ),
  );

  const { id, name, description, model } = modelInfo;
  const { uri, scale, color } = model;

  const modelEntity = viewer.entities.add({
    id,
    name,
    description,
    position: cartesianPosition,
    orientation: transformedOrientation,
    model: {
      uri,
      scale,
      color,
    },
  });

  return modelEntity;
}

function createAreaPoint({ viewer, position }) {
  const point = viewer.entities.add({
    position,
    point: {
      pixelSize: 4,
      color: Cesium.Color.SKYBLUE,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });

  return point;
}

function createAreaPolygon({ viewer, hierarchy }) {
  const polygon = viewer.entities.add({
    polygon: {
      hierarchy,
      material: new Cesium.ColorMaterialProperty(
        Cesium.Color.SKYBLUE.withAlpha(0.5),
      ),
    },
  });

  return polygon;
}

function createLinePoint({ viewer, position, geoInfo }) {
  const [longitude, latitude] = geoInfo;
  const point = viewer.entities.add({
    position,
    point: {
      pixelSize: 9,
      color: Cesium.Color.GOLD,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    longitude,
    latitude,
  });

  return point;
}

function createDashline({ viewer, positions }) {
  const dashline = viewer.entities.add({
    polyline: {
      positions,
      width: 2,
      clampToGround: true,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.YELLOW,
        dashLength: 16.0,
        dashPattern: 255,
      }),
    },
  });

  return dashline;
}

function createPolyline({ viewer, positions }) {
  const polyline = viewer.entities.add({
    polyline: {
      positions,
      width: 5,
      clampToGround: true,
      material: Cesium.Color.GOLD,
    },
  });

  return polyline;
}

export {
  addModelEntity,
  createAreaPoint,
  createAreaPolygon,
  createLinePoint,
  createDashline,
  createPolyline,
};
