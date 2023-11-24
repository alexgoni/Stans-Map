import { Viewer } from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import TerrainEditWidget from "@/components/widget/ui/tool/TerrainEditWidget";
import TerrainEditor from "@/components/module/tool/terrain/TerrainEditor";
import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  modifyTerrainState,
  terrainWidgetState,
} from "@/recoil/atom/TerrainState";
import createCustomTerrainProvider from "@/components/module/CustomTerrainProvider";
import TerrainLoading from "@/components/widget/loading/TerrainLoading";

export default function Terrain() {
  const terrainEditorRef = useRef(null);
  const viewerRef = useRef(null);
  const isTerrainEditorOpen = useRecoilValue(terrainWidgetState);
  const [modifyState, setModifyState] = useRecoilState(modifyTerrainState);
  const [slideValue, setSlideValue] = useState(0);
  const [modifyClick, setModifyClick] = useState(false);

  const resetModifyState = () => {
    setModifyClick(false);
    setModifyState(false);
  };

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
        homeButton: false,
      });
      viewerRef.current = viewer;

      const terrainEditor = new TerrainEditor(viewer);
      terrainEditorRef.current = terrainEditor;
    })();

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, []);

  // terrainArea
  useDidMountEffect(() => {
    const terrainEditor = terrainEditorRef.current;

    isTerrainEditorOpen ? terrainEditor.startDraw() : terrainEditor.stopDraw();
  }, [isTerrainEditorOpen]);

  // modify terrain
  useDidMountEffect(() => {
    if (!modifyClick) return;

    const terrainEditor = terrainEditorRef.current;
    const selectedPositions = terrainEditor.getSelectedPositions();
    selectedPositions ? setModifyState(true) : resetModifyState();

    (async () => {
      await terrainEditor.modifyTerrain(selectedPositions, slideValue);
    })();
  }, [modifyClick]);

  return (
    <>
      <TerrainEditWidget
        viewer={viewerRef.current}
        setModifyClick={setModifyClick}
        setSlideValue={setSlideValue}
      />
      {modifyState && (
        <TerrainLoading
          viewer={viewerRef.current}
          resetModifyState={resetModifyState}
        />
      )}
    </>
  );
}
