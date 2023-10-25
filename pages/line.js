import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { defaultCamera } from "@/components/handler/cesium/Camera";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import LineDrawer from "@/components/module/measurement/Line";

export default function Line() {
  const [drawLine, setDrawLine] = useState(false);
  const lineDrawerRef = useRef(null);

  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
    });

    defaultCamera(viewer, [127.08018445000782, 37.635648085178175, 1000]);

    // lindDrawer 인스턴스 생성
    const lineDrawer = new LineDrawer(viewer);
    lineDrawerRef.current = lineDrawer;

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const lineDrawer = lineDrawerRef.current;

    if (drawLine) {
      lineDrawer.startDrawing();
    } else {
      lineDrawer.stopDrawing();
      lineDrawer.clearLineGroupArr();
    }

    return () => {
      lineDrawer.stopDrawing();
    };
  }, [drawLine]);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => {
          setDrawLine(true);
        }}
      >
        Start Drawing line
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          setDrawLine(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
