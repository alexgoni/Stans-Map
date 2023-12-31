import { atom } from "recoil";

export const distanceWidgetState = atom({
  key: "distanceWidgetState",
  default: false,
});

export const radiusWidgetState = atom({
  key: "radiusWidgetState",
  default: false,
});

export const areaWidgetState = atom({
  key: "areaWidgetState",
  default: false,
});

export const measureEventOnState = atom({
  key: "measureEventOnState",
  default: false,
});
