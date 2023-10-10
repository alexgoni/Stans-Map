import { defaultCamera } from "@/components/handler/cesium/Camera";
import Viewer from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";

export default function Circle2() {
  const [drawCircle, setDrawCircle] = useState(false);

  const viewerRef = useRef(null);

  const circleGroupArr = [];

  useEffect(() => {
    const viewer = Viewer();
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
    let endPoint = null;
    let circle = null;
    let label = null;
    let startDistance = null;
    let endDistance = null;
    let initClick = true;

    let circleGroup = {};

    function clickEvent(click) {
      const cartesian = viewer.camera.pickEllipsoid(click.position);

      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);

        if (initClick) {
          startPoint = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
            point: {
              pixelSize: 6,
              color: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.RED,
              outlineWidth: 1,
            },
            longitude: longitude,
            latitude: latitude,
          });

          circleGroup.startPoint = startPoint;
          initClick = false;
        } else {
          endPoint = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
            point: {
              pixelSize: 6,
              color: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.RED,
              outlineWidth: 1,
            },
            longitude: longitude,
            latitude: latitude,
          });
          circleGroup.endPoint = endPoint;

          startDistance = Cesium.Cartographic.fromDegrees(
            startPoint.longitude,
            startPoint.latitude,
          );
          endDistance = Cesium.Cartographic.fromDegrees(
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

          const properties = new Cesium.EllipseGraphics({
            semiMinorAxis: surfaceDistance,
            semiMajorAxis: surfaceDistance,
            height: 1.0,
            material: Cesium.Color.RED.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.RED,
            outlineWidth: 4,
          });

          circle = viewer.entities.add({
            position: startPoint.position,
            ellipse: properties,
          });

          circleGroup.circle = circle;
          circleGroup.radius = surfaceDistance;

          label = viewer.entities.add({
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
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -10),
              showBackground: true,
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
            viewer.entities.remove(element.circle);
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
