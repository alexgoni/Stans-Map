import Viewer from "@/components/handler/cesium/Viewer";
import React, { useEffect } from "react";
import * as Cesium from "cesium";

export default function test() {
  useEffect(() => {
    const viewer = Viewer({ terrain: Cesium.Terrain.fromWorldTerrain() });

    const positionData = [
      Cesium.Cartesian3.fromDegrees(-75.62898254394531, 40.02804946899414),
      Cesium.Cartesian3.fromDegrees(-75.62898254394531, 40.12804946899414),
      Cesium.Cartesian3.fromDegrees(-75.72898254394531, 40.12804946899414),
      Cesium.Cartesian3.fromDegrees(-75.72898254394531, 40.02804946899414),
    ];

    const polygon = viewer.entities.add({
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.WHITE.withAlpha(0.7),
        ),
      },
    });
    viewer.zoomTo(polygon);

    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <div
      id="cesiumContainer"
      className="m-0 h-screen w-screen overflow-hidden p-0"
    ></div>
  );
}
