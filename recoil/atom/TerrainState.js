import { atom } from "recoil";

export const terrainWidgetState = atom({
  key: "terrainWidgetState",
  default: false,
});

export const modifyButtonClickState = atom({
  key: "modifyButtonClickState",
  default: false,
});

export const terrainResetButtonClickState = atom({
  key: "terrainResetButtonClickState",
  default: false,
});

export const targetHeightValue = atom({
  key: "targetHeightValue",
  default: 0,
});

export const currentTerrainLayerId = atom({
  key: "currentTerrainLayerId",
  default: null,
});
