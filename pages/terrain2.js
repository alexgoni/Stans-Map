import { Viewer } from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import TerrainEditWidget from "@/components/widget/tool/TerrainEditor";
import TerrainEditor from "@/components/module/tool/terrain/TerrainEditor";
import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  modifyTerrainFlag,
  terrainEditorState,
} from "@/recoil/atom/TerrainState";
import createCustomTerrainProvider from "@/components/module/CustomTerrainProvider";
import TerrainLoading from "@/components/widget/loading/TerrainLoading";

export default function Terrain2() {
  const terrainEditorRef = useRef(null);
  const viewerRef = useRef(null);
  const terrainEditorOpen = useRecoilValue(terrainEditorState);
  const [modifyState, setModifyState] = useRecoilState(modifyTerrainFlag);
  const [isSelected, setIsSelected] = useState(false);
  const [slideValue, setSlideValue] = useState(0);

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

    terrainEditorOpen ? terrainEditor.startEdit() : terrainEditor.stopEdit();
  }, [terrainEditorOpen]);

  // modify terrain
  useDidMountEffect(() => {
    if (!modifyState) return;

    (async () => {
      const terrainEditor = terrainEditorRef.current;
      await terrainEditor.modifyTerrain(slideValue);
    })();
  }, [modifyState]);

  return (
    <>
      {modifyState && (
        <TerrainLoading
          viewer={viewerRef.current}
          setIsSelected={setIsSelected}
        />
      )}
      <TerrainEditWidget
        viewer={viewerRef.current}
        setSlideValue={setSlideValue}
      />
    </>
  );
}
