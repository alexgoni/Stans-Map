import { flyCamera } from "@/components/handler/Camera";
import Viewer from "@/components/handler/Viewer";
import * as Cesium from "cesium";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const viewer = Viewer({ terrain: Cesium.Terrain.fromWorldTerrain() });

    flyCamera(viewer, [-122.4175, 37.655, 400], [0, -15, 0]);

    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
    </>
  );
}
