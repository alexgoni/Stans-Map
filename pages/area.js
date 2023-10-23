import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { defaultCamera } from "@/components/handler/cesium/Camera";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import AreaDrawer from "@/components/module/measurement/Area";

// TODO: 코드 단순화(함수화), drag 기능, 직선으로 면적?(구글 어스)
export default function Area() {
  const areaDrawerRef = useRef(null);
  const [drawArea, setDrawArea] = useState(false);

  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
    });

    defaultCamera(viewer, [127.08018445000782, 37.635648085178175, 1000]);

    // areaDrawer 인스턴스 생성
    const areaDrawer = new AreaDrawer(viewer);
    areaDrawerRef.current = areaDrawer;

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const areaDrawer = areaDrawerRef.current;

    drawArea ? areaDrawer.startDrawing() : areaDrawer.stopDrawing();
    // areaDrawer.clearLineGroupArr();

    return () => {
      areaDrawer.stopDrawing();
    };
  }, [drawArea]);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => {
          setDrawArea(true);
        }}
      >
        Start Drawing Area
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          setDrawArea(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
