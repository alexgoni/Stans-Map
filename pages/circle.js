import { defaultCamera } from "@/components/handler/cesium/Camera";
import Viewer from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";

export default function Circle() {
  const [drawingCircle, setDrawingCircle] = useState(false);
  const [circleCenter, setCircleCenter] = useState(null);
  const [secondClick, setSecondClick] = useState(false);

  const viewerRef = useRef(null);
  const firstClickPositionRef = useRef(null);

  useEffect(() => {
    const viewer = Viewer({});

    viewerRef.current = viewer;

    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click) => {
      if (drawingCircle) {
        const cartesian = viewer.camera.pickEllipsoid(click.position);

        if (cartesian) {
          if (secondClick) {
            setCircleCenter(cartesian);
            setDrawingCircle(false);
          } else {
            firstClickPositionRef.current = cartesian;
            setSecondClick(true);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      viewer.destroy();
      handler.destroy();
    };
  }, [drawingCircle, secondClick]);

  useDidMountEffect(() => {
    const viewer = viewerRef.current;

    if (circleCenter) {
      const firstClickPosition = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(
        firstClickPositionRef.current,
      );

      const semiMinorAxis = Cesium.Cartesian3.distance(
        firstClickPosition,
        circleCenter,
      );
      const semiMajorAxis = semiMinorAxis;

      const properties = new Cesium.EllipseGraphics({
        semiMinorAxis: semiMinorAxis,
        semiMajorAxis: semiMajorAxis,
        height: 0.0,
        material: Cesium.Color.RED.withAlpha(0.5),
      });

      viewer.entities.add({
        position: circleCenter,
        ellipse: properties,
      });
    }
  }, [circleCenter]);

  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      <button
        className="fixed left-4 top-4 z-50"
        onClick={() => {
          setDrawingCircle(true);
          setSecondClick(false);
        }}
      >
        Start Drawing Circle
      </button>
    </>
  );
}
