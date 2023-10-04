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

  const entity = viewer.entities.add({
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

  return entity;
}

export { addModelEntity };
