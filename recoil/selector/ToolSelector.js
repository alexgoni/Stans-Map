import { selector } from "recoil";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "../atom/MeasurementState";
import { terrainWidgetState } from "../atom/TerrainState";
import { buildWidgetState } from "../atom/BuildState";

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
        set(terrainWidgetState, false);
        set(buildWidgetState, false);
        break;
      case "radius":
        set(distanceWidgetState, false);
        set(areaWidgetState, false);
        set(terrainWidgetState, false);
        set(buildWidgetState, false);
        break;
      case "area":
        set(distanceWidgetState, false);
        set(radiusWidgetState, false);
        set(terrainWidgetState, false);
        set(buildWidgetState, false);
        break;
      case "terrain":
        set(distanceWidgetState, false);
        set(radiusWidgetState, false);
        set(areaWidgetState, false);
        set(buildWidgetState, false);
        break;
      case "build":
        set(distanceWidgetState, false);
        set(radiusWidgetState, false);
        set(areaWidgetState, false);
        set(terrainWidgetState, false);
        break;
      default:
        break;
    }
  },
});
