import { defaultCamera } from "@/components/handler/cesium/Camera";
import { Viewer } from "@/components/handler/cesium/Viewer";
import createCustomTerrainProvider from "@/components/module/CustomTerrainProvider";
import MeasureSection from "@/sections/MeasureSection";
import ModelEventSection from "@/sections/ModelEventSection";
import TerrainSection from "@/sections/TerrainSection";
import * as Cesium from "cesium";
import { useEffect, useState } from "react";

export default function POC2() {
  const [viewer, setViewer] = useState(null);

  // viewer
  useEffect(() => {
    (async () => {
      const defaultTerrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
        "http://localhost:8081/",
      );
      const customTerrainProvider = createCustomTerrainProvider(
        defaultTerrainProvider,
      );

      const viewer = Viewer({
        terrainProvider: customTerrainProvider,
        koreaHomeButton: true,
      });
      viewer.scene.globe.depthTestAgainstTerrain = true;
      setViewer(viewer);

      defaultCamera(viewer, [127.08049, 37.63457, 500]);
    })();

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
          <TerrainSection viewer={viewer} />
        </>
      )}
    </>
  );
}
