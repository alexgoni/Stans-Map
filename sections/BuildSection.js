import {
  buildKhalifaModelState,
  buildOfficeModelState,
  buildTechnoModelState,
  buildWidgetState,
} from "@/recoil/atom/BuildState";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import * as Cesium from "cesium";
import { getRayPosition } from "@/components/handler/cesium/GeoInfo";

export default function BuildSection({ viewer }) {
  const buildWidgetOpen = useRecoilValue(buildWidgetState);
  const buildTechnoModel = useRecoilValue(buildTechnoModelState);
  const buildOfficeModel = useRecoilValue(buildOfficeModelState);
  const buildKhalifaModel = useRecoilValue(buildKhalifaModelState);

  useEffect(() => {
    if (!buildWidgetOpen) return;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click) => {
      const clickPosition = getRayPosition({
        viewer,
        position: click.position,
      });
      if (!Cesium.defined(clickPosition)) return;

      switch (true) {
        case buildTechnoModel:
          viewer.entities.add({
            position: clickPosition,
            model: {
              uri: "/glb/techno.glb",
              scale: 0.01,
            },
          });
          break;
        case buildOfficeModel:
          viewer.entities.add({
            position: clickPosition,
            model: {
              uri: "/glb/office_building.glb",
              scale: 1,
            },
          });
          break;
        case buildKhalifaModel:
          viewer.entities.add({
            position: clickPosition,
            model: {
              uri: "/glb/burj_khalifa.glb",
              scale: 30,
            },
          });
          break;
        default:
          break;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [buildWidgetOpen, buildTechnoModel, buildOfficeModel, buildKhalifaModel]);

  return <></>;
}
