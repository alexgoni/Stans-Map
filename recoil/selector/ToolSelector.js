import { selector } from "recoil";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "../atom/MeasurementState";
import { terrainEditorState } from "../atom/TerrainState";

export const exclusiveToolSelector = selector({
  key: "exclusiveToolSelector",
  get: ({ get }) => {
    return null;
  },
  set: ({ set }, selectedTool) => {
    switch (selectedTool) {
      case "distance":
        set(radiusWidgetState, false);
        set(areaWidgetState, false);
        set(terrainEditorState, false);
        break;
      case "radius":
        set(distanceWidgetState, false);
        set(areaWidgetState, false);
        set(terrainEditorState, false);
        break;
      case "area":
        set(distanceWidgetState, false);
        set(radiusWidgetState, false);
        set(terrainEditorState, false);
        break;
      case "terrain":
        set(distanceWidgetState, false);
        set(radiusWidgetState, false);
        set(areaWidgetState, false);
        break;
      default:
        break;
    }
  },
});
