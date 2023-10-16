import Viewer from "@/components/handler/cesium/Viewer";
import React, { useEffect } from "react";
import * as Cesium from "cesium";

export default function test() {
  useEffect(() => {
    const viewer = Viewer({ terrain: Cesium.Terrain.fromWorldTerrain() });

    const longitude = 127;
    const latitude = 38;
    const cartographicPosition = Cesium.Cartographic.fromDegrees(
      longitude,
      latitude,
    );

    const cartesian2Position = new Cesium.Cartesian2(
      cartographicPosition.longitude,
      cartographicPosition.latitude,
    ); // Cartesian2 좌표 생성

    // Cartesian2를 Cartographic으로 변환
    const position = Cesium.Cartographic.fromCartesian(cartesian2Position);

    console.log(position);

    // // cartographicPosition에서 경도, 위도 정보를 추출
    // const longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
    // const latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);

    console.log(`경도: ${longitude}, 위도: ${latitude}`);

    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <div
      id="cesiumContainer"
      className="m-0 h-screen w-screen overflow-hidden p-0"
    ></div>
  );
}

function clickEvent(click) {
  const ray = viewer.camera.getPickRay(click.position);
  const earthPosition = viewer.scene.globe.pick(ray, viewer.scene);
  if (Cesium.defined(earthPosition)) {
    const cartographic = Cesium.Cartographic.fromCartesian(earthPosition);

    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);

    if (initClick) {
      startPoint = viewer.entities.add({
        position: earthPosition,
        point: {
          pixelSize: 6,
          color: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.RED,
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },

        longitude: longitude,
        latitude: latitude,
      });

      circleGroup.startPoint = startPoint;
      initClick = false;
    } else {
      const endPoint = viewer.entities.add({
        position: earthPosition,
        point: {
          pixelSize: 6,
          color: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.RED,
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },

        longitude: longitude,
        latitude: latitude,
      });
      circleGroup.endPoint = endPoint;

      const startDistance = Cesium.Cartographic.fromDegrees(
        startPoint.longitude,
        startPoint.latitude,
      );
      const endDistance = Cesium.Cartographic.fromDegrees(
        endPoint.longitude,
        endPoint.latitude,
      );

      const ellipsoid = Cesium.Ellipsoid.WGS84;
      const geodesic = new Cesium.EllipsoidGeodesic(
        startDistance,
        endDistance,
        ellipsoid,
      );
      const surfaceDistance = geodesic.surfaceDistance;

      const circlePrimitive = viewer.scene.primitives.add(
        new Cesium.GroundPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.CircleGeometry({
              center: startPoint.position._value,
              radius: surfaceDistance,
            }),
          }),
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: Cesium.Material.fromType("Color", {
              color: new Cesium.Color(1.0, 0.0, 0.0, 0.3),
            }),
          }),
        }),
      );

      circleGroup.circle = circlePrimitive;
      circleGroup.radius = surfaceDistance;

      const label = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          startPoint.longitude,
          startPoint.latitude,
          2,
        ),
        label: {
          text: `${surfaceDistance.toFixed(2)}m`,
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

      circleGroup.label = label;
      initClick = true;

      circleGroupArr.push({ ...circleGroup });
    }
  }
}
