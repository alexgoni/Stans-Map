import { defaultCamera } from "@/components/handler/cesium/Camera";
import Viewer from "@/components/handler/cesium/Viewer";
import AreaDrawer from "@/components/module/measurement/Area";
import CircleDrawer from "@/components/module/measurement/Circle";
import Drawer from "@/components/module/measurement/Drawer";
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

  const widgetStateObj = {
    distanceWidgetOpen,
    radiusWidgetOpen,
    areaWidgetOpen,
  };

  const viewerRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
    });

    viewerRef.current = viewer;

    defaultCamera(viewer, [127.08018445000782, 37.635648085178175, 1000]);

    const drawer = new Drawer(viewer);
    drawerRef.current = drawer;

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const drawer = drawerRef.current;

    drawer.setWidgetState(widgetStateObj);
    drawer.drawingHandler();

    return () => {
      drawer.cleanUpDrawer();
    };
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen]);

  return (
    <>
      <ToolBox />
    </>
  );
}
