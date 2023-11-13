import { useEffect } from "react";
import * as Cesium from "cesium";
import { Viewer } from "@/components/handler/cesium/Viewer";
import createCustomTerrainProvider from "@/components/module/CustomTerrainProvider";

export default function MapTest() {
  useEffect(() => {
    const geomap = new Cesium.WebMapServiceImageryProvider({
      url: "http://localhost:8188/geoserver/wms",
      parameters: {
        format: "image/png",
        transparent: "true",
        tiled: true,
        enablePickFeatures: true,
      },
      layers: "Nowon",
      maximumLevel: 20,
    });

    let viewer;
    (async () => {
      const defaultTerrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
        "http://localhost:8081/",
      );

      const customTerrainProvider = createCustomTerrainProvider(
        defaultTerrainProvider,
      );

      viewer = Viewer({
        terrainProvider: customTerrainProvider,
        baseLayer: geomap,
      });

      const positions = Cesium.Cartesian3.fromDegreesArray([
        127.07049, 37.62457, 127.07049, 37.64457, 127.09049, 37.64457,
        127.09049, 37.62457,
      ]);

      viewer.terrainProvider.setFloor(positions, -500);
    })();

    return () => {
      viewer?.destroy();
    };
  }, []); // Empty dependency array ensures this useEffect runs once on mount

  return <></>;
}
