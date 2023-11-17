import Drawer from "@/components/module/tool/measurement/Drawer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import MeasurementBox from "@/components/widget/tool/Measurement";
import {
  areaWidgetState,
  distanceWidgetState,
  measureWidgetCloseState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function MeasureSection({ viewer }) {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const areaWidgetOpen = useRecoilValue(areaWidgetState);
  const setMeasureWidgetClose = useSetRecoilState(measureWidgetCloseState);
  const drawerRef = useRef(null);
  const widgetStateObj = {
    distanceWidgetOpen,
    radiusWidgetOpen,
    areaWidgetOpen,
  };

  useEffect(() => {
    const drawer = new Drawer(viewer);
    drawerRef.current = drawer;
  }, []);

  useDidMountEffect(() => {
    const drawer = drawerRef.current;

    drawer.setWidgetState(widgetStateObj);
    drawer.handleAllShapes();

    setMeasureWidgetClose(
      !distanceWidgetOpen && !radiusWidgetOpen && !areaWidgetOpen,
    );

    return () => {
      drawer.cleanUpDrawer();
    };
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen]);

  return <MeasurementBox />;
}
