import { useState, useEffect, useRef } from "react";
import * as Cesium from "cesium";
import Viewer from "@/components/handler/cesium/Viewer";
import { defaultCamera } from "@/components/handler/cesium/Camera";

export default function Area2() {
  const viewerRef = useRef(null);
  const [drawArea, setDrawArea] = useState(false);

  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      // animation: false,
      // baseLayerPicker: false,
      selectionIndicator: true,
      infoBox: true,
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;
    const positions = Cesium.Cartesian3.fromDegreesArray([
      -115.0, 37.0, -115.0, 32.0, -107.0, 38.0, -102.0, 31.0, -102.0, 35.0,
      -115.0, 37.0,
    ]);

    const polygon = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: Cesium.Color.SKYBLUE.withAlpha(0.5),
        // height: 10000,
      },
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    });

    viewer.zoomTo(polygon);

    return () => {
      viewer.destroy();
    };
  }, []);

  // useEffect(() => {
  //   const viewer = viewerRef.current;

  //   if (drawArea) {
  //     const positions = Cesium.Cartesian3.fromDegreesArray([
  //       -115.0, 37.0, -115.0, 32.0, -107.0, 38.0, -102.0, 31.0, -102.0, 35.0,
  //       -115.0, 37.0,
  //     ]);

  //     const polygon = viewer.entities.add({
  //       polygon: {
  //         hierarchy: new Cesium.PolygonHierarchy(positions),
  //         material: Cesium.Color.SKYBLUE.withAlpha(0.5),

  //         extrudedHeight: 0,
  //       },
  //     });

  //     viewer.zoomTo(polygon);
  //   }
  // }, [drawArea]);

  return (
    <>
      {/* <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => {
          setDrawArea(true);
        }}
      >
        Start Drawing Area
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          setDrawArea(false);
        }}
      >
        Clear Entities
      </button> */}
    </>
  );
}
