import MeasureController from "@/components/module/tool/measurement/Controller";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import {
  areaWidgetState,
  distanceWidgetState,
  measureEventOnState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function MeasureSection({ viewer, setMeasureRef }) {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const areaWidgetOpen = useRecoilValue(areaWidgetState);
  const isMeasureEventOn = useSetRecoilState(measureEventOnState);
  const controllerRef = useRef(null);
  const widgetStateObj = {
    distanceWidgetOpen,
    radiusWidgetOpen,
    areaWidgetOpen,
  };

  useEffect(() => {
    const controller = new MeasureController(viewer);
    controllerRef.current = controller;
    setMeasureRef(controller);
  }, []);

  useDidMountEffect(() => {
    const controller = controllerRef.current;

    controller.setWidgetState(widgetStateObj);
    controller.handleAllShapes();

    isMeasureEventOn(distanceWidgetOpen || radiusWidgetOpen || areaWidgetOpen);

    return () => {
      controller.cleanUpDrawing();
    };
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen]);

  return <></>;
}
