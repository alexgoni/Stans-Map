import { Viewer } from "@/components/handler/cesium/Viewer";
import { useEffect } from "react";
import * as Cesium from "cesium";
import { getRayPosition } from "@/components/handler/cesium/GeoInfo";

export default function Test() {
  useEffect(() => {
    const viewer = Viewer();

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click) => {
      const clickPosition = getRayPosition({
        viewer,
        position: click.position,
      });
      if (!Cesium.defined(clickPosition)) return;

      viewer.entities.add({
        position: clickPosition,
        model: {
          uri: "/glb/airplane.glb",
          scale: 100,
        },
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      viewer.destroy();
    };
  }, []);

  return <></>;
}
