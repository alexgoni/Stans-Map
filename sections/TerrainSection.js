import TerrainLoading from "@/components/widget/loading/TerrainLoading";
import TerrainEditWidget from "@/components/widget/tool/TerrainEditor";
import {
  modifyTerrainFlag,
  terrainEditorState,
} from "@/recoil/atom/TerrainState";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import TerrainEditor from "@/components/module/tool/terrain/TerrainEditor";
import useDidMountEffect from "@/components/module/useDidMountEffect";

export default function TerrainSection({ viewer }) {
  const isTerrainEditorOpen = useRecoilValue(terrainEditorState);
  const [modifyState, setModifyState] = useRecoilState(modifyTerrainFlag);
  const [modifyClick, setModifyClick] = useState(false);
  const [slideValue, setSlideValue] = useState(0);
  const terrainEditorRef = useRef(null);

  const resetModifyState = () => {
    setModifyClick(false);
    setModifyState(false);
  };

  useEffect(() => {
    const terrainEditor = new TerrainEditor(viewer);
    terrainEditorRef.current = terrainEditor;
  }, []);

  // terrainArea
  useDidMountEffect(() => {
    const terrainEditor = terrainEditorRef.current;

    isTerrainEditorOpen ? terrainEditor.startEdit() : terrainEditor.stopEdit();
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
      {modifyState && (
        <TerrainLoading viewer={viewer} resetModifyState={resetModifyState} />
      )}
      <TerrainEditWidget
        viewer={viewer}
        setModifyClick={setModifyClick}
        setSlideValue={setSlideValue}
      />
    </>
  );
}
