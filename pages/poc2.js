import { defaultCamera } from "@/components/handler/cesium/Camera";
import { Viewer } from "@/components/handler/cesium/Viewer";
import MeasureSection from "@/sections/MeasureSection";
import ModelEventSection from "@/sections/ModelEventSection";
import * as Cesium from "cesium";
import { useEffect, useState } from "react";

export default function POC2() {
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    // viewer 생성
    const viewer = Viewer({
      terrain: new Cesium.Terrain(
        Cesium.CesiumTerrainProvider.fromUrl("http://localhost:8081/"),
      ),
      animation: false,
      baseLayerPicker: false,
      koreaHomeButton: true,
    });
    setViewer(viewer);

    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <>
      {viewer && (
        <>
          <ModelEventSection viewer={viewer} />
          <MeasureSection viewer={viewer} />
        </>
      )}
    </>
  );
}
