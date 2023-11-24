import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { Viewer } from "@/components/handler/cesium/Viewer";
import { defaultCamera } from "@/components/handler/cesium/Camera";

export default function Dam() {
  const [viewer, setViewer] = useState(null);
  useEffect(() => {
    (async () => {
      const defaultTerrainProvider =
        await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

      const viewer = Viewer({ terrainProvider: defaultTerrainProvider });
      setViewer(viewer);
      defaultCamera(viewer, [129.509444, 35.83361, 1000]);
      viewer.extend(Cesium.viewerCesiumInspectorMixin);

      // token 변경
      const tileset = viewer.scene.primitives.add(
        await Cesium.Cesium3DTileset.fromIonAssetId(2360991),
      );
      console.log(tileset);

      viewer.zoomTo(tileset);
    })();

    return () => {
      viewer.destroy();
    };
  }, []);

  return <></>;
}
