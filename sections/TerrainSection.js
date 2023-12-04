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
    terrainWidgetOpen ? terrainEditor.startDraw() : terrainEditor.stopDraw();
  }, [terrainWidgetOpen]);

  useEffect(() => {
    console.log(currentTerrainId);
  }, [currentTerrainId]);

  // modify terrain
  useDidMountEffect(() => {
    if (!modifyButtonClick) return;

    debugger;
    const terrainEditor = terrainEditorRef.current;
    let selectedPositions;
    if (!currentTerrainId) {
      selectedPositions = terrainEditor.getSelectedPositions();
    } else {
      selectedPositions =
        terrainEditor.getSelectedPositionsById(currentTerrainId);
    }

    selectedPositions ? setTerrainLoadingOn(true) : resetModifyState();

    (async () => {
      await terrainEditor.modifyTerrain(selectedPositions, targetHeight);
    })();
  }, [modifyButtonClick]);

  return (
    <>
      {(terrainLoadingOn || resetButtonClick) && (
        <TerrainLoading viewer={viewer} resetModifyState={resetModifyState} />
      )}
    </>
  );
}
