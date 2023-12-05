import { selector } from "recoil";
import {
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
        break;
      case "techno":
        set(buildOfficeModelState, false);
        break;
      case "office":
        set(buildTechnoModelState, false);
        break;
      default:
        break;
    }
  },
});
