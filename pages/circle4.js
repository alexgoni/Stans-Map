import { defaultCamera } from "@/components/handler/cesium/Camera";
import Viewer from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";

// TODO: 개별 삭제, 예상 primitive, drag
// FIXME: surfaceDistance
export default function Circle4() {
  const [drawCircle, setDrawCircle] = useState(false);

  const viewerRef = useRef(null);

  const circleGroupArr = [];

  useEffect(() => {
    const viewer = Viewer({ terrain: Cesium.Terrain.fromWorldTerrain() });
    viewerRef.current = viewer;

    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const viewer = viewerRef.current;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // 이전에 등록된 이벤트 핸들러를 제거
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    let startPoint = null;
    let initClick = true;

    let circleGroup = {};

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

    if (drawCircle) {
      handler.setInputAction(
        clickEvent,
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      );
    }

    return () => {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
  }, [drawCircle]);

  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => setDrawCircle(true)}
      >
        Start Drawing Circle
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          circleGroupArr.forEach((element) => {
            const viewer = viewerRef.current;
            viewer.entities.remove(element.startPoint);
            viewer.entities.remove(element.endPoint);
            viewer.scene.primitives.remove(element.circle);
            viewer.entities.remove(element.label);
            setDrawCircle(false);
          });

          // 빈 배열로 초기화
          circleGroupArr.length = 0;
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
