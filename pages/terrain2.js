import React, { useEffect } from "react";
import * as Cesium from "cesium";
import CustomCesiumTerrainProvider from "@/components/module/CustomCesiumterrainProvider";

export default function Terrain() {
  useEffect(() => {
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YTY3ZDVhNC0zMThlLTQxZjUtODhmOS04ZmJjZGY4MDM4MDEiLCJpZCI6MTQzNzkxLCJpYXQiOjE2ODU2ODkwNDF9.3RQSwjKyySalcp1nUufcBxUk_hNALFLJ9j-X0-FoEpI";

    function createWorldTerrain(options) {
      const url = Cesium.IonResource.fromAssetId(1);
      console.log(url);
      const temp = new CustomCesiumTerrainProvider({
        url,
        requestVertexNormals: Cesium.defaultValue(
          options.requestVertexNormals,
          false,
        ),
        requestWaterMask: Cesium.defaultValue(options.requestWaterMask, false),
      });
      console.log(temp);
      return temp;
    }

    const viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: createWorldTerrain({}),
    });

    const largePolygonPositions = Cesium.Cartesian3.fromDegreesArray([
      127, 37, 127, 38, 128, 38, 128, 37, 127, 37,
    ]);

    const positions = largePolygonPositions;

    const entity = viewer.entities.add({
      polygon: {
        hierarchy: positions,
        material: Cesium.Color.RED.withAlpha(0.0),
      },
    });

    // FIXME: 줌 안됨
    viewer.zoomTo(entity);

    viewer.terrainProvider.setFloor(positions, -10000);
    //   viewer.scene.globe._surface.tileProvider._debug.wireframe = true;

    console.log(viewer.scene.globe);

    return () => {
      viewer.destroy();
    };
  }, []);

  return <></>;
}
