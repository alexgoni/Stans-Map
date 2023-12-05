import { selector } from "recoil";
import {
  buildKhalifaModelState,
  buildOfficeModelState,
  buildTechnoModelState,
} from "../atom/BuildState";

export const buildingModelOnOffSelector = selector({
  key: "buildingModelOnOffSelector",
  get: ({ get }) => {
    return null;
  },
  set: ({ set }, state) => {
    switch (state) {
      case "toolOff":
        set(buildTechnoModelState, false);
        set(buildOfficeModelState, false);
        set(buildKhalifaModelState, false);
        break;
      case "techno":
        set(buildOfficeModelState, false);
        set(buildKhalifaModelState, false);
        break;
      case "office":
        set(buildTechnoModelState, false);
        set(buildKhalifaModelState, false);
        break;
      case "khalifa":
        set(buildTechnoModelState, false);
        set(buildOfficeModelState, false);
        break;
      default:
        break;
    }
  },
});
