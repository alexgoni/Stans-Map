import { flyCamera } from "@/components/handler/cesium/Camera";
import { Viewer } from "@/components/handler/cesium/Viewer";
import * as Cesium from "cesium";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // viewer 생성
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
    });

    // camera 설정
    flyCamera(viewer, [-122.4175, 37.655, 400], [0, -15, 0]);

    return () => {
      viewer.destroy();
    };
  }, []);

  return <></>;
}
