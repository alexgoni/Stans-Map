import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect } from "react";
import * as Cesium from "cesium";

export default function Area() {
  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
    });
  }, []);

  return <></>;
}
