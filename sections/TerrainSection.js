import TerrainLoading from "@/components/widget/loading/TerrainLoading";
import {
  currentTerrainLayerId,
  modifyButtonClickState,
  targetHeightValue,
  terrainResetButtonClickState,
  terrainWidgetState,
} from "@/recoil/atom/TerrainState";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import TerrainEditor from "@/components/module/tool/terrain/TerrainEditor";
import useDidMountEffect from "@/components/module/useDidMountEffect";

export default function TerrainSection({ viewer, setTerrainRef }) {
  const terrainWidgetOpen = useRecoilValue(terrainWidgetState);
  const targetHeight = useRecoilValue(targetHeightValue);
  const [modifyButtonClick, setModifyButtonClick] = useRecoilState(
    modifyButtonClickState,
  );
  const [resetButtonClick, setResetButtonClick] = useRecoilState(
    terrainResetButtonClickState,
  );
  const currentTerrainId = useRecoilValue(currentTerrainLayerId);
  const [terrainLoadingOn, setTerrainLoadingOn] = useState(false);
  const terrainEditorRef = useRef(null);

  const resetModifyState = () => {
    setModifyButtonClick(false);
    setTerrainLoadingOn(false);
    setResetButtonClick(false);
  };

  useEffect(() => {
    const terrainEditor = new TerrainEditor(viewer);
    terrainEditorRef.current = terrainEditor;
    setTerrainRef(terrainEditor);
  }, []);

  // terrainArea
  useDidMountEffect(() => {
    const terrainEditor = terrainEditorRef.current;

    if (terrainWidgetOpen) {
      terrainEditor.startDraw();
    } else {
      terrainEditor.stopDrawWidgetSwitch();
      terrainEditor.clearNoModifyEntity();
    }
  }, [terrainWidgetOpen]);

  useDidMountEffect(() => {
    const terrainEditor = terrainEditorRef.current;
    currentTerrainId ? terrainEditor.stopDraw() : terrainEditor.startDraw();
  }, [currentTerrainId]);

  // modify terrain
  useDidMountEffect(() => {
    if (!modifyButtonClick) return;

    const terrainEditor = terrainEditorRef.current;

    const selectedPositions = currentTerrainId
      ? terrainEditor.getSelectedPositions(currentTerrainId)
      : terrainEditor.getSelectedPositions();
    selectedPositions ? setTerrainLoadingOn(true) : resetModifyState();

    (async () => {
      await terrainEditor.modifyTerrain(selectedPositions, targetHeight);
    })();
    !currentTerrainId && terrainEditor.startDraw();
  }, [modifyButtonClick]);

  return (
    <>
      {(terrainLoadingOn || resetButtonClick) && (
        <TerrainLoading viewer={viewer} resetModifyState={resetModifyState} />
      )}
    </>
  );
}
