import * as Cesium from "cesium";
import * as turf from "@turf/turf";

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

function createUnkinkedPolygon({ viewer, turfPointPositionArr }) {
  turfPointPositionArr.push(turfPointPositionArr[0]);

  const poly = turf.polygon([turfPointPositionArr]);
  const unkinkPolygon = turf.unkinkPolygon(poly);

  const polygonArr = [];

  unkinkPolygon.features.forEach((element) => {
    const coordinateArr = element.geometry.coordinates.flat(2);
    const positions = Cesium.Cartesian3.fromDegreesArray(coordinateArr);

    const polygon = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: Cesium.Color.RED.withAlpha(0.5),
      },
    });

    polygonArr.push(polygon);
  });

  return polygonArr;
}

function createLinePoint({ viewer, position }) {
  const point = viewer.entities.add({
    position,
    point: {
      pixelSize: 9,
      color: Cesium.Color.GOLD,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
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

function createCenterPoint({ viewer, position }) {
  const point = viewer.entities.add({
    position,
    point: {
      pixelSize: 6,
      color: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 1,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });

  return point;
}

function createCircle({ viewer, position }) {
  const circle = viewer.entities.add({
    position,
    ellipse: {
      semiMinorAxis: 0.01,
      semiMajorAxis: 0.01,
      material: Cesium.Color.RED.withAlpha(0.3),
    },
  });

  return circle;
}

function createLabel({ viewer, position }) {
  const label = viewer.entities.add({
    position,
    label: {
      text: "0.00m", // Default text, can be updated later
      font: "14px sans-serif",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      scale: 1,
      showBackground: true,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      pixelOffset: new Cesium.Cartesian2(0, -10),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });

  return label;
}

export {
  addModelEntity,
  createAreaPoint,
  createAreaPolygon,
  createUnkinkedPolygon,
  createLinePoint,
  createDashline,
  createPolyline,
  createCenterPoint,
  createCircle,
  createLabel,
};
