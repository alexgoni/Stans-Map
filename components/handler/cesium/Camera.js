import * as Cesium from "cesium";

function defaultCamera(viewer, position, orientation = []) {
  // position 배열로 받음
  const [longitude, latitude, height] = position;

  const cartesianPosition = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    height,
  );

  // orientation 배열로 받음
  const [heading = 0, pitch = -90, roll = 0] = orientation;

  const transformedOrientation = {
    heading: Cesium.Math.toRadians(heading),
    pitch: Cesium.Math.toRadians(pitch),
    roll: roll,
  };

  const options = {
    destination: cartesianPosition,
    orientation: transformedOrientation,
  };

  viewer.scene.camera.setView(options);
}

function flyCamera(viewer, destination, orientation = []) {
  // destination 배열로 받음
  const [longitude, latitude, height] = destination;

  const cartesianDestination = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    height,
  );

  // orientation 배열로 받음
  const [heading = 0, pitch = -90, roll = 0] = orientation;

  const transformedOrientation = {
    heading: Cesium.Math.toRadians(heading),
    pitch: Cesium.Math.toRadians(pitch),
    roll: roll,
  };

  viewer.camera.flyTo({
    destination: cartesianDestination,
    orientation: transformedOrientation,
  });
}

function cloneCameraPosition(viewer) {
  const currentCameraPosition = viewer.camera.position.clone();

  const currentCameraHeading = viewer.camera.heading;
  const currentCameraPitch = viewer.camera.pitch;
  const currentCameraRoll = viewer.camera.roll;

  const currentCameraOrientation = {
    heading: currentCameraHeading,
    pitch: currentCameraPitch,
    roll: currentCameraRoll,
  };

  return { currentCameraPosition, currentCameraOrientation };
}

export { defaultCamera, flyCamera, cloneCameraPosition };
