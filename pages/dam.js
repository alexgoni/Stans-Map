import React, { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { Viewer } from "@/components/handler/cesium/Viewer";
import { defaultCamera } from "@/components/handler/cesium/Camera";

export default function Dam() {
  const viewerRef = useRef(null);
  useEffect(() => {
    let viewer;
    (async () => {
      const defaultTerrainProvider =
        await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

      // const customTerrainProvider = createCustomTerrainProvider(
      //   defaultTerrainProvider,
      // );

      viewer = Viewer({ terrainProvider: defaultTerrainProvider });

      viewer.extend(Cesium.viewerCesiumInspectorMixin);
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // const elevationDataArray = [
      //   {
      //     positions: positions1,
      //     height,
      //   },
      //   {
      //     positions: positions2,
      //     height: 500,
      //   },
      // ];

      // viewer.terrainProvider.setGlobalFloor(elevationDataArray);

      viewerRef.current = viewer;

      defaultCamera(viewer, [129.509444, 35.83361, 1000]);
    })();

    return () => {
      viewerRef.current?.destroy();
    };
  }, []);

  return <></>;
}

Cesium.Draco;
