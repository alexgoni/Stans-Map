import { useState, useEffect, useRef } from "react";
import * as Cesium from "cesium";
import Viewer from "@/components/handler/cesium/Viewer";
import { defaultCamera } from "@/components/handler/cesium/Camera";
import * as turf from "@turf/turf";
import useDidMountEffect from "@/components/module/useDidMountEffect";

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

    viewerRef.current = viewer;

    // const positions = Cesium.Cartesian3.fromDegreesArray([
    //   -115.0, 37.0, -115.0, 32.0, -107.0, 38.0, -102.0, 31.0, -102.0, 35.0,
    //   -115.0, 37.0,
    // ]);

    // const polygon = viewer.entities.add({
    //   polygon: {
    //     hierarchy: new Cesium.PolygonHierarchy(positions),
    //     material: Cesium.Color.SKYBLUE.withAlpha(0.5),
    //     // height: 10000,
    //   },
    //   heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    // });

    // viewer.zoomTo(polygon);

    const poly = turf.polygon([
      [
        [-115.0, 37.0],
        [-115.0, 32.0],
        [-107.0, 38.0],
        [-102.0, 31.0],
        [-102.0, 35.0],
        [-115.0, 37.0],
      ],
    ]);

    const unkinkPolygon = turf.unkinkPolygon(poly);

    unkinkPolygon.features.forEach((element) => {
      const coordinateArr = element.geometry.coordinates.flat(2);
      const positions = Cesium.Cartesian3.fromDegreesArray(coordinateArr);

      const polygon = viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(positions),
          material: Cesium.Color.RED.withAlpha(0.5),
        },
      });
    });

    return () => {
      viewer.destroy();
    };
  }, []);

  return <></>;
}
