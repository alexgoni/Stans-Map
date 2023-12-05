import { atom } from "recoil";

export const buildWidgetState = atom({
  key: "buildWidgetState",
  default: false,
});

export const buildTechnoModelState = atom({
  key: "buildTechnoModelState",
  default: false,
});

export const buildOfficeModelState = atom({
  key: "buildOfficeModelState",
  default: false,
});

export const buildKhalifaModelState = atom({
  key: "buildKhalifaModelState",
  default: false,
});
