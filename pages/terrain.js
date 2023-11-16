import { Viewer } from "@/components/handler/cesium/Viewer";
import TerrainAreaDrawer from "@/components/module/tool/terrain/TerrainArea";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import TerrainEditor from "@/components/widget/tool/TerrainEditor";
import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  modifyTerrainFlag,
  terrainEditorState,
} from "@/recoil/atom/MeasurementState";
import createCustomTerrainProvider from "@/components/module/CustomTerrainProvider";
import TerrainLoading from "@/components/widget/loading/TerrainLoading";

export default function Terrain() {
  const terrainAreaDrawerRef = useRef(null);
  const viewerRef = useRef(null);
  const terrainEditorOpen = useRecoilValue(terrainEditorState);
  const [modifyState, setModifyState] = useRecoilState(modifyTerrainFlag);
  const [isSelected, setIsSelected] = useState(false);
  const [slideValue, setSlideValue] = useState(0);
  const [elevationDataArray, setElevationDataArray] = useState([]);

  // viewer
  useEffect(() => {
    (async () => {
      const defaultTerrainProvider =
        await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
      const customTerrainProvider = createCustomTerrainProvider(
        defaultTerrainProvider,
      );

      const viewer = Viewer({
        terrainProvider: customTerrainProvider,
        geocoder: true,
      });
      viewerRef.current = viewer;

      const terrainAreaDrawer = new TerrainAreaDrawer(viewer);
      terrainAreaDrawerRef.current = terrainAreaDrawer;
    })();

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  // terrainArea
  useDidMountEffect(() => {
    const terrainAreaDrawer = terrainAreaDrawerRef.current;
    if (terrainEditorOpen) terrainAreaDrawer.startDrawing();

    return () => {
      terrainAreaDrawer.onRightClick();
      terrainAreaDrawer.stopDrawing();
      terrainAreaDrawer.clearAreaGroupArr();
    };
  }, [terrainEditorOpen]);

  // modify terrain
  useDidMountEffect(() => {
    if (!modifyState) return;
    const viewer = viewerRef.current;
    const terrainAreaDrawer = terrainAreaDrawerRef.current;

    const selectedPositions = terrainAreaDrawer.getSelectedPositions();
    if (!selectedPositions) {
      setIsSelected(false);
      setModifyState(false);
      return;
    } else {
      setIsSelected(true);
    }

    const heightArr = [];
    const promises = selectedPositions.map((position) => {
      const carto = Cesium.Cartographic.fromCartesian(position);
      return Cesium.sampleTerrain(viewer.terrainProvider, 11, [carto]).then(
        (updatedPositions) => {
          heightArr.push(updatedPositions[0].height);
        },
      );
    });
    Promise.all(promises).then(() => {
      const averageHeight =
        heightArr.reduce((acc, cur) => {
          return acc + cur;
        }, 0) / heightArr.length;

      const targetHeight = averageHeight + slideValue;
      const newElevationDataArray = [
        ...elevationDataArray,
        { positions: selectedPositions, height: targetHeight },
      ];
      viewer.terrainProvider.setGlobalFloor(newElevationDataArray);
      setElevationDataArray(newElevationDataArray);
    });
    terrainAreaDrawer.afterEditTerrain();
  }, [modifyState]);

  return (
    <>
      {isSelected && modifyState ? (
        <TerrainLoading
          viewer={viewerRef.current}
          setIsSelected={setIsSelected}
        />
      ) : null}
      <TerrainEditor viewer={viewerRef.current} setSlideValue={setSlideValue} />
    </>
  );
}
