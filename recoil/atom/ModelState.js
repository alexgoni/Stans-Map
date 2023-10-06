import { atom } from "recoil";
import * as Cesium from "cesium";

export const tecnoModelState = atom({
  key: "tecnoModelState",
  default: {
    position: [127.08049, 37.63457, 0],
    orientation: [105, 0, 0],
    info: {
      name: "Tecno Building",
      description: "STANS 4th floor",
      model: {
        uri: "/glb/tecno.glb",
        scale: 0.01,
      },
    },
  },
});

export const floorsModelState = atom({
  key: "floorsState",
  default: [
    {
      position: [127.08081, 37.63456, 15],
      orientation: [16, 0, 0],
      info: {
        description: "3th Floor",
        model: {
          uri: "/glb/Floor3.glb",
          scale: 1.2,
          color: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.0),
        },
      },
    },
    {
      position: [127.08081, 37.63456, 15],
      orientation: [16, 0, 0],
      info: {
        description: "4th Floor",
        model: {
          uri: "/glb/Floor4.glb",
          scale: 1.2,
          color: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.0),
        },
      },
    },
    {
      position: [127.08081, 37.63456, 15],
      orientation: [16, 0, 0],
      info: {
        description: "5th Floor",
        model: {
          uri: "/glb/Floor5.glb",
          scale: 1.2,
          color: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.0),
        },
      },
    },
  ],
});
