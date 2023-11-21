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

      viewer = Viewer({ terrainProvider: defaultTerrainProvider });

      defaultCamera(viewer, [129.509444, 35.83361, 1000]);

      const tileset = viewer.scene.primitives.add(
        await Cesium.Cesium3DTileset.fromIonAssetId(2360991),
      );
      viewer.zoomTo(tileset);
    })();

    return () => {
      viewerRef.current?.destroy();
    };
  }, []);

  return <></>;
}

Cesium.Draco;
