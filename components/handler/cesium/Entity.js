import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import { calculateArea } from "./GeoInfo";

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

// function createAreaPolygon({ viewer, hierarchy }) {
//   const polygon = viewer.entities.add({
//     polygon: {
//       hierarchy,
//       material: new Cesium.ColorMaterialProperty(
//         Cesium.Color.SKYBLUE.withAlpha(0.5),
//       ),
//     },
//   });

//   return polygon;
// }

function createAreaPolygon({ viewer, hierarchy }) {
  const { positions, holes } = hierarchy;

  const polygon = viewer.entities.add({
    polygon: {
      hierarchy: {
        positions,
        holes: holes || [],
      },
      material: new Cesium.ColorMaterialProperty(
        Cesium.Color.SKYBLUE.withAlpha(0.5),
      ),
    },
  });

  return polygon;
}

function createAreaPolyline({ viewer, positions }) {
  const polyline = viewer.entities.add({
    polyline: {
      positions: positions,
      width: 5,
      clampToGround: true,
      material: Cesium.Color.SKYBLUE.withAlpha(0.5),
    },
  });

  return polyline;
}

function createKinkedPolygon({ viewer, turfPointPositionArr }) {
  // 같은 곳 여러번 클릭으로 생기는 중복 정점 제거
  const uniquePoints = turfPointPositionArr.filter(
    (point, index, self) =>
      index === self.findIndex((p) => p[0] === point[0] && p[1] === point[1]),
  );
  uniquePoints.push(uniquePoints[0]);

  const poly = turf.polygon([uniquePoints]);
  const unkinkPolygon = turf.unkinkPolygon(poly).features;

  const polygonArr = [];

  for (let idx = 0; idx < unkinkPolygon.length; idx++) {
    const element = unkinkPolygon[idx];
    const coordinateArr = element.geometry.coordinates;
    const positions = Cesium.Cartesian3.fromDegreesArray(coordinateArr.flat(2));

    if (idx !== unkinkPolygon.length - 1) {
      const outerPoly = turf.polygon(coordinateArr);
      const innerPoly = turf.polygon(
        unkinkPolygon[idx + 1].geometry.coordinates,
      );
      const isContain = turf.booleanContains(outerPoly, innerPoly);

      if (isContain) {
        // 포함 관계인 경우
        const innerCoordinateArr =
          unkinkPolygon[idx + 1].geometry.coordinates.flat(2);
        const innerPositions =
          Cesium.Cartesian3.fromDegreesArray(innerCoordinateArr);

        const hierarchy = {
          positions,
          holes: [{ positions: innerPositions }],
        };

        const polygon = createAreaPolygon({ viewer, hierarchy });
        polygonArr.push(polygon);

        idx++; // 다음 원소로 넘어감
      } else {
        // 포함 관계가 아닌 경우
        const polygon = createAreaPolygon({ viewer, hierarchy: { positions } });
        polygonArr.push(polygon);
      }
    } else {
      // 가장 안쪽 polygon이거나 simple polygon인 경우
      const polygon = createAreaPolygon({ viewer, hierarchy: { positions } });
      polygonArr.push(polygon);
    }
  }

  return polygonArr;
}

// function createKinkedPolygon({ viewer, turfPointPositionArr }) {
//   turfPointPositionArr.push(turfPointPositionArr[0]);

//   const poly = turf.polygon([turfPointPositionArr]);
//   const unkinkPolygon = turf.unkinkPolygon(poly).features;

//   const polygonArr = [];
//   let total = 0;

//   for (let idx = 0; idx < unkinkPolygon.length; idx++) {
//     const element = unkinkPolygon[idx];
//     const coordinateArr = element.geometry.coordinates;
//     const positions = Cesium.Cartesian3.fromDegreesArray(coordinateArr.flat(2));

//     // // 다각형 넓이 계산
//     // console.log(element.geometry.coordinates);
//     // const area = turf.area(element);
//     // console.log(`다각형 넓이: ${area} 제곱 미터`);
//     // total += area;

//     if (idx !== unkinkPolygon.length - 1) {
//       const outerPoly = turf.polygon(coordinateArr);
//       const innerPoly = turf.polygon(
//         unkinkPolygon[idx + 1].geometry.coordinates,
//       );
//       const isContain = turf.booleanContains(outerPoly, innerPoly);

//       if (isContain) {
//         // 포함 관계인 경우

//         const innerCoordinateArr =
//           unkinkPolygon[idx + 1].geometry.coordinates.flat(2);
//         const innerPositions =
//           Cesium.Cartesian3.fromDegreesArray(innerCoordinateArr);

//         const hierarchy = {
//           positions,
//           holes: [{ positions: innerPositions }],
//         };

//         const polygon = viewer.entities.add({
//           polygon: {
//             hierarchy,
//             material: Cesium.Color.RED.withAlpha(0.5),
//           },
//         });
//         polygonArr.push(polygon);

//         idx++; // 다음 원소로 넘어감
//       } else {
//         // 포함 관계가 아닌 경우

//         const polygon = viewer.entities.add({
//           polygon: {
//             hierarchy: {
//               positions,
//             },
//             material: Cesium.Color.BLUE.withAlpha(0.5),
//           },
//         });
//         polygonArr.push(polygon);
//       }
//     } else {
//       // 가장 안쪽 polygon이거나 simple polygon인 경우

//       const polygon = viewer.entities.add({
//         polygon: {
//           hierarchy: {
//             positions,
//           },
//           material: Cesium.Color.GREEN.withAlpha(0.5),
//         },
//       });
//       polygonArr.push(polygon);
//       polygonArr.push(polygon);
//     }
//   }

//   console.log(`전체 넓이: ${total} 제곱 미터`);

//   return polygonArr;
// }

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
  createAreaPolyline,
  createAreaPolygon,
  createKinkedPolygon,
  createLinePoint,
  createDashline,
  createPolyline,
  createCenterPoint,
  createCircle,
  createLabel,
};
