import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import LineDrawer from "@/components/module/tool/measurement/Line";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { Viewer } from "@/components/handler/cesium/Viewer";

export default function Test() {
  const [drawLine, setDrawLine] = useState(false);

  const lineDrawerRef = useRef(null);

  useEffect(() => {
    let viewer = null;

    (async () => {
      viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
          requestVertexNormals: true,
        }),
      });

      const position = Cesium.Cartographic.fromDegrees(86.925, 27.9881);
      Cesium.sampleTerrain(viewer.terrainProvider, 11, [position]).then(
        function (updatedPositions) {
          console.log(updatedPositions);
          const height = updatedPositions[0].height;
          console.log(`높이: ${height} 미터`);
        },
      );

      const lineDrawer = new LineDrawer(viewer);
      lineDrawerRef.current = lineDrawer;
    })();

    return () => {};
  }, []);

  useEffect(() => {
    const lineDrawer = lineDrawerRef.current;

    if (!lineDrawer) return;

    if (drawLine) {
      lineDrawer.startDrawing();
      console.log(lineDrawer.startDrawing);
    } else {
      lineDrawer.stopDrawing();
      lineDrawer.clearLineGroupArr();
    }

    return () => {
      lineDrawer.stopDrawing();
    };
  }, [drawLine]);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => {
          setDrawLine(true);
        }}
      >
        Start Drawing line
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          setDrawLine(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
