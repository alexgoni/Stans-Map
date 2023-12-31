import { atom } from "recoil";
import * as Cesium from "cesium";

export const technoModelState = atom({
  key: "technoModelState",
  default: {
    position: [127.08049, 37.63457, 38], // height: 38 (기준 Cesium.Terrain.FrowWorldTerrain)
    orientation: [105, 0, 0],
    info: {
      name: "Techno Building",
      description: "STANS 4th floor",
      model: {
        uri: "/glb/techno.glb",
        scale: 0.01,
      },
    },
  },
});

export const floorsModelState = atom({
  key: "floorsState",
  default: [
    {
      position: [127.08081, 37.63456, 53],
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
      position: [127.08081, 37.63456, 53],
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
      position: [127.08081, 37.63456, 53],
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
