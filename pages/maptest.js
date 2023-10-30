import { useEffect } from "react";
import * as Cesium from "cesium";
import { Viewer } from "@/components/handler/cesium/Viewer";

export default function MapTest() {
  useEffect(() => {
    const geomap = new Cesium.WebMapServiceImageryProvider({
      url: "http://192.168.1.45:8188/geoserver/wms",
      parameters: {
        format: "image/png",
        transparent: "true",
        tiled: true,
        enablePickFeatures: true,
      },
      layers: "stans:protoMap",
      maximumLevel: 20,
    });

    const viewer = Viewer({
      terrain: new Cesium.Terrain(
        Cesium.CesiumTerrainProvider.fromUrl("http://localhost:8081/"),
      ),
      baseLayer: geomap,
    });

    return () => {
      viewer.destroy();
    };
  }, []); // Empty dependency array ensures this useEffect runs once on mount

  return <></>;
}
