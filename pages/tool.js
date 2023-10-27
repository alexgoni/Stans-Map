import { defaultCamera } from "@/components/handler/cesium/Camera";
import Viewer from "@/components/handler/cesium/Viewer";
import AreaDrawer from "@/components/module/measurement/Area";
import CircleDrawer from "@/components/module/measurement/Circle";
import LineDrawer from "@/components/module/measurement/Line";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import ToolBox from "@/components/widget/measurement/ToolBox";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

export default function Tool() {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const areaWidgetOpen = useRecoilValue(areaWidgetState);

  const viewerRef = useRef(null);
  const lineDrawerRef = useRef(null);
  const circleDrawerRef = useRef(null);
  const areaDrawerRef = useRef(null);

  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
    });

    viewerRef.current = viewer;

    defaultCamera(viewer, [127.08018445000782, 37.635648085178175, 1000]);

    const lineDrawer = new LineDrawer(viewer);
    const circleDrawer = new CircleDrawer(viewer);
    const areaDrawer = new AreaDrawer(viewer);

    lineDrawerRef.current = lineDrawer;
    circleDrawerRef.current = circleDrawer;
    areaDrawerRef.current = areaDrawer;

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const lineDrawer = lineDrawerRef.current;
    const circleDrawer = circleDrawerRef.current;
    const areaDrawer = areaDrawerRef.current;

    if (distanceWidgetOpen) {
      lineDrawer.startDrawing();
    } else {
      lineDrawer.stopDrawing();
      lineDrawer.clearLineGroupArr();
    }

    if (radiusWidgetOpen) {
      circleDrawer.startDrawing();
    } else {
      circleDrawer.stopDrawing();
      circleDrawer.clearCircleGroupArr();
    }

    if (areaWidgetOpen) {
      areaDrawer.startDrawing();
    } else {
      areaDrawer.stopDrawing();
      areaDrawer.clearAreaGroupArr();
    }

    return () => {
      circleDrawer.stopDrawing();
      areaDrawer.stopDrawing();
      lineDrawer.stopDrawing();
    };
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen]);

  return (
    <>
      <ToolBox />
    </>
  );
}
