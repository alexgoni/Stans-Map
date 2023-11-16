import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { useRecoilValue } from "recoil";
import { tecnoModelState } from "@/recoil/atom/ModelState";
import createCustomTerrainProvider from "@/components/module/CustomTerrainProvider";
import { Viewer } from "@/components/handler/cesium/Viewer";
import AreaDrawer from "@/components/module/tool/measurement/Area";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import TerrainAreaDrawer from "@/components/module/tool/terrain/TerrainArea";

export default function Terrain() {
  const tecnoModel = useRecoilValue(tecnoModelState);
  const [height, setHeight] = useState(20);
  const [drawArea, setDrawArea] = useState(false);
  const [start, setStart] = useState(false);
  const [index, setIndex] = useState(0);

  const viewerRef = useRef(null);
  const terrainAreaDrawerRef = useRef(null);

  const positions1 = Cesium.Cartesian3.fromDegreesArray([
    127.178, 37.732, 127.178, 37.736, 127.182, 37.736, 127.182, 37.732,
  ]);

  const positions2 = Cesium.Cartesian3.fromDegreesArray([
    127.183, 37.738, 127.183, 37.742, 127.188, 37.742, 127.188, 37.738,
  ]);

  const [elevationDataArray, setElevationDataArray] = useState([
    {
      positions: positions1,
      height,
    },
    {
      positions: positions2,
      height: 500,
    },
  ]);

  useEffect(() => {
    let viewer;
    // terrainProvider 설정할 때는 async / await 사용
    (async () => {
      const defaultTerrainProvider =
        await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

      const customTerrainProvider = createCustomTerrainProvider(
        defaultTerrainProvider,
      );

      viewer = Viewer({ terrainProvider: customTerrainProvider });

      viewer.extend(Cesium.viewerCesiumInspectorMixin);
      viewer.scene.globe.depthTestAgainstTerrain = true;

      viewer.terrainProvider.setGlobalFloor(elevationDataArray);

      viewerRef.current = viewer;

      const tecno = addModelEntity({
        viewer,
        position: [127.1805, 37.73458, height],
        orientation: [105, 0, 0],
        modelInfo: tecnoModel.info,
      });

      viewer.zoomTo(tecno);

      const terrainAreaDrawer = new TerrainAreaDrawer(viewer);
      terrainAreaDrawerRef.current = terrainAreaDrawer;
    })();

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  useDidMountEffect(() => {
    const terrainAreaDrawer = terrainAreaDrawerRef.current;

    drawArea
      ? terrainAreaDrawer.startDrawing()
      : terrainAreaDrawer.stopDrawing();

    return () => {
      terrainAreaDrawer.stopDrawing();
    };
  }, [drawArea]);

  useDidMountEffect(() => {
    if (!start) return;
    const terrainAreaDrawer = terrainAreaDrawerRef.current;

    const positionArr = terrainAreaDrawer.getSelectedPositions();
    setIndex(index + 1);
    const newElevationDataArray = [
      ...elevationDataArray,
      { positions: positionArr, height: 500 },
    ];
    setElevationDataArray(newElevationDataArray);
    setStart(false);
  }, [start]);

  // elevationDataArray가 업데이트될 때마다 실행되도록 useEffect 사용
  useDidMountEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    viewer.terrainProvider.setGlobalFloor(elevationDataArray);
  }, [elevationDataArray]);

  // useDidMountEffect(() => {
  //   const viewer = viewerRef.current;
  //   viewer.terrainProvider.setFloor(positions1, height);
  //   // tecno model position도 같이 움직여야함
  // }, [height]);

  // useEffect(() => {
  //   if (!viewerRef.current) return;
  //   const viewer = viewerRef.current;

  // }, [viewerRef.current]);

  return (
    <>
      <button
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
      </button>
      <button
        className="fixed left-4 top-28 z-50 bg-white p-4"
        onClick={() => {
          setStart(true);
        }}
      >
        modify
      </button>
    </>
  );
}
