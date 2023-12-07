import { defaultCamera } from "@/components/handler/cesium/Camera";
import { Viewer } from "@/components/handler/cesium/Viewer";
import createCustomTerrainProvider from "@/components/module/lib/CustomTerrainProvider";
import UIWrapper from "@/components/widget/ui/UIWrapper";
import BuildSection from "@/sections/BuildSection";
import MeasureSection from "@/sections/MeasureSection";
import ModelEventSection from "@/sections/ModelEventSection";
import TerrainSection from "@/sections/TerrainSection";
import * as Cesium from "cesium";
import { useEffect, useState } from "react";

export default function MainPage() {
  const [viewer, setViewer] = useState(null);
  const [measureRef, setMeasureRef] = useState(null);
  const [terrainRef, setTerrainRef] = useState(null);
  const [toolController, setToolController] = useState(null);

  // viewer
  useEffect(() => {
    (async () => {
      // const defaultTerrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      //   "http://localhost:8081/",
      // );
      const defaultTerrainProvider =
        await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
      const customTerrainProvider = createCustomTerrainProvider(
        defaultTerrainProvider,
      );

      const viewer = Viewer({
        terrainProvider: customTerrainProvider,
        homeButton: false,
      });
      viewer.scene.globe.depthTestAgainstTerrain = true;
      setViewer(viewer);

      defaultCamera(viewer, [127.08049, 37.63457, 500]);
    })();

    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    setToolController({ measure: measureRef, terrain: terrainRef });
  }, [measureRef, terrainRef]);

  return (
    <>
      {viewer && (
        <>
          <UIWrapper viewer={viewer} toolController={toolController} />
          <ModelEventSection viewer={viewer} />
          <MeasureSection viewer={viewer} setMeasureRef={setMeasureRef} />
          <TerrainSection viewer={viewer} setTerrainRef={setTerrainRef} />
          <BuildSection viewer={viewer} />
        </>
      )}
    </>
  );
}
