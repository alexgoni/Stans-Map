import { atom } from "recoil";

export const terrainEditorState = atom({
  key: "terrainEditorState",
  default: false,
});

export const modifyTerrainFlag = atom({
  key: "modifyTerrainFlag",
  default: false,
});
