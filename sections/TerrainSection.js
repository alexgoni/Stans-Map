import TerrainLoading from "@/components/widget/loading/TerrainLoading";
import {
  modifyButtonClickState,
  targetHeightValue,
  terrainWidgetState,
} from "@/recoil/atom/TerrainState";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import TerrainEditor from "@/components/module/tool/terrain/TerrainEditor";
import useDidMountEffect from "@/components/module/useDidMountEffect";

export default function TerrainSection({ viewer }) {
  const terrainWidgetOpen = useRecoilValue(terrainWidgetState);
  const targetHeight = useRecoilValue(targetHeightValue);
  const [modifyButtonClick, setModifyButtonClick] = useRecoilState(
    modifyButtonClickState,
  );
  const [terrainLoadingOn, setTerrainLoadingOn] = useState(false);
  const terrainEditorRef = useRef(null);

  const resetModifyState = () => {
    setModifyButtonClick(false);
    setTerrainLoadingOn(false);
  };

  useEffect(() => {
    const terrainEditor = new TerrainEditor(viewer);
    terrainEditorRef.current = terrainEditor;
  }, []);

  // terrainArea
  useDidMountEffect(() => {
    const terrainEditor = terrainEditorRef.current;

    // viewer.scene.globe._surface.tileProvider._debug.wireframe =
    //   terrainWidgetOpen;
    terrainWidgetOpen ? terrainEditor.startDraw() : terrainEditor.stopDraw();
  }, [terrainWidgetOpen]);

  // modify terrain
  useDidMountEffect(() => {
    if (!modifyButtonClick) return;

    const terrainEditor = terrainEditorRef.current;
    const selectedPositions = terrainEditor.getSelectedPositions();
    selectedPositions ? setTerrainLoadingOn(true) : resetModifyState();

    (async () => {
      await terrainEditor.modifyTerrain(selectedPositions, targetHeight);
    })();
  }, [modifyButtonClick]);

  return (
    <>
      {terrainLoadingOn && (
        <TerrainLoading viewer={viewer} resetModifyState={resetModifyState} />
      )}
    </>
  );
}
