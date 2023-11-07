import { Viewer } from "@/components/handler/cesium/Viewer";
import React, { useEffect } from "react";
import * as Cesium from "cesium";
import CustomCesiumTerrainProvider from "@/components/module/CustomCesiumterrainProvider";

export default function Terrain() {
  useEffect(() => {
    let viewer;

    (async () => {
      try {
        async function createWorldTerrain() {
          const provider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

          return new CustomCesiumTerrainProvider({
            url: Cesium.IonResource.fromAssetId(1),
          });
        }

        const viewer = new Cesium.Viewer("cesiumContainer", {
          terrainProvider: await createWorldTerrain(),
        });

        const largePolygonPositions = Cesium.Cartesian3.fromDegreesArray([
          127, 37,

          127, 38,

          128, 38,

          128, 37,

          127, 37,
        ]);

        const positions = largePolygonPositions;

        viewer.entities.add({
          polygon: {
            hierarchy: positions,
            material: Cesium.Color.RED.withAlpha(0.0),
          },
        });

        // viewer.terrainProvider.setFloor(positions, -10000);
        // //   viewer.scene.globe._surface.tileProvider._debug.wireframe = true;
        // viewer.zoomTo(viewer.entities);

        //   (async () => {
        //     const temp = await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

        //     console.log(temp);
        //   })();
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      if (!viewer) return;
      viewer.destroy();
    };
  }, []);

  return <></>;
}
