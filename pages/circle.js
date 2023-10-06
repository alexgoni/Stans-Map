import { defaultCamera } from "@/components/handler/cesium/Camera";
import Viewer from "@/components/handler/cesium/Viewer";
import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";

export default function Circle() {
  const [drawingCircle, _setDrawingCircle] = useState(false);
  const [viewer, setViewer] = useState(null);

  const setDrawingCircle = (value) => {
    drawingCircleRef.current = value;
    _setDrawingCircle(value);
  };

  const drawingCircleRef = useRef(null);

  const viewerRef = useRef(null);

  let startPoint = null;
  let endPoint = null;
  let startDistance = null;
  let endDistance = null;

  useEffect(() => {
    const viewer = Viewer();
    viewerRef.current = viewer;
    setViewer(viewer);

    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    // handler 선언
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // click to create points
    handler.setInputAction((click) => {
      if (!drawingCircleRef.current) return;

      const cartesian = viewer.camera.pickEllipsoid(click.position);

      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);

        if (!startPoint) {
          startPoint = viewer.entities.add({
            id: "start_point",
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
        } else if (!endPoint) {
          endPoint = viewer.entities.add({
            id: "end_point",
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

          viewer.entities.add({
            position: startPoint.position,
            ellipse: properties,
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      viewer.destroy();
      handler.destroy();
    };
  }, []);

  const clearEntities = () => {
    viewer.entities.removeAll();
    startPoint = null;
    endPoint = null;
    startDistance = null;
    endDistance = null;
  };

  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => setDrawingCircle(true)}
      >
        Start Drawing Circle
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          clearEntities();
          setDrawingCircle(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
