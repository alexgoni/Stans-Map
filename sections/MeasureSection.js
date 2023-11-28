import Drawer from "@/components/module/tool/measurement/Drawer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import {
  areaWidgetState,
  distanceWidgetState,
  measureEventOnState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function MeasureSection({ viewer, setDrawerRef }) {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const areaWidgetOpen = useRecoilValue(areaWidgetState);
  const isMeasureEventOn = useSetRecoilState(measureEventOnState);
  const drawerRef = useRef(null);
  const widgetStateObj = {
    distanceWidgetOpen,
    radiusWidgetOpen,
    areaWidgetOpen,
  };

  useEffect(() => {
    const drawer = new Drawer(viewer);
    drawerRef.current = drawer;
    setDrawerRef(drawer);
  }, []);

  useDidMountEffect(() => {
    const drawer = drawerRef.current;

    drawer.setWidgetState(widgetStateObj);
    drawer.handleAllShapes();

    isMeasureEventOn(distanceWidgetOpen || radiusWidgetOpen || areaWidgetOpen);

    return () => {
      drawer.cleanUpDrawer();
    };
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen]);

  return <></>;
}
