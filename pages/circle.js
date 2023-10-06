import { defaultCamera } from "@/components/handler/cesium/Camera";
import Viewer from "@/components/handler/cesium/Viewer";
import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";

export default function Circle() {
  const [drawCircle, setDrawCircle] = useState(false);
  const [viewer, setViewer] = useState(null);

  const viewerRef = useRef(null);

  let startPoint = null;
  let endPoint = null;
  let circle = null;
  let startDistance = null;
  let endDistance = null;
  let initClick = true;

  const circleGroupArr = [];

  useEffect(() => {
    const viewer = Viewer();
    viewerRef.current = viewer;
    setViewer(viewer);

    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // 위젯 오픈 상태 아닐 시 현재 등록된 이벤트 리스너 해제
    if (!drawCircle) {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      initClick = true;
      return;
    }

    // click to create points
    handler.setInputAction((click) => {
      const cartesian = viewer.camera.pickEllipsoid(click.position);

      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);

        let circleGroup = {};

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

          initClick = true;
          circleGroup.circle = circle;
          circleGroup.radius = surfaceDistance;

          circleGroupArr.push(circleGroup);

          console.log(circleGroupArr);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 언마운트시 이벤트 리스너 해제
    return () => {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
  }, [drawCircle]);

  const clearEntities = () => {
    console.log(circleGroupArr);
    //TODO: circle 관련 entity만 제거
    circleGroupArr.forEach((element) => {
      viewer.entities.remove(element.circle);
      viewer.entities.remove(element.startPoint);
      viewer.entities.remove(element.endPoint);
    });
  };

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
          clearEntities();
          setDrawCircle(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
