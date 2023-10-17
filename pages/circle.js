import { defaultCamera } from "@/components/handler/cesium/Camera";
import { circleDrawingHandler } from "@/components/handler/cesium/measurement/Radius";
import Viewer from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import ToolBox from "@/components/widget/measurement/ToolBox";
import { radiusWidgetState } from "@/recoil/atom/MeasurementState";
import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

export default function Circle() {
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);

  const viewerRef = useRef(null);

  // entities 객체 배열
  const circleGroupArr = [];

  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
    });
    viewerRef.current = viewer;

    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const viewer = viewerRef.current;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    circleDrawingHandler({
      viewer,
      handler,
      circleGroupArr,
      radiusWidgetOpen,
    });

    return () => {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
  }, [radiusWidgetOpen]);

  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      <ToolBox />
    </>
  );
}
