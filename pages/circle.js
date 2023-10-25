import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { defaultCamera } from "@/components/handler/cesium/Camera";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import CircleDrawer from "@/components/module/measurement/Circle";

export default function Circle() {
  const circleDrawerRef = useRef(null);
  const [drawCircle, setDrawCircle] = useState(false);

  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
    });

    defaultCamera(viewer, [127.08018445000782, 37.635648085178175, 1000]);

    // circleDrawer 인스턴스 생성
    const circleDrawer = new CircleDrawer(viewer);
    circleDrawerRef.current = circleDrawer;

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const circleDrawer = circleDrawerRef.current;

    if (drawCircle) {
      circleDrawer.startDrawing();
    } else {
      circleDrawer.stopDrawing();
      circleDrawer.clearCircleGroupArr();
    }

    return () => {
      circleDrawer.stopDrawing();
    };
  }, [drawCircle]);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => {
          setDrawCircle(true);
        }}
      >
        Start Drawing Area
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          setDrawCircle(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
