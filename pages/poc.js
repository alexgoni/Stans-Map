import { defaultCamera } from "@/components/handler/cesium/Camera";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { getPositionObj } from "@/components/handler/cesium/ModelEventHandler";
import { Viewer } from "@/components/handler/cesium/Viewer";
import ModelEvent from "@/components/module/model/ModelEvent";
import {
  ModelGroup,
  ModelGroupInfo,
} from "@/components/module/model/ModelGroup";
import Drawer from "@/components/module/measurement/Drawer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import Modal from "@/components/widget/Modal";
import ToolBox from "@/components/widget/measurement/ToolBox";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { floorsModelState, tecnoModelState } from "@/recoil/atom/ModelState";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import * as Cesium from "cesium";

export default function POC() {
  const tecnoModel = useRecoilValue(tecnoModelState);
  const floorsModel = useRecoilValue(floorsModelState);
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const areaWidgetOpen = useRecoilValue(areaWidgetState);

  const widgetStateObj = {
    distanceWidgetOpen,
    radiusWidgetOpen,
    areaWidgetOpen,
  };

  const viewerRef = useRef(null);
  const modelEventRef = useRef(null);
  const drawerRef = useRef(null);

  const [widgetAllClose, setWidgetAllClose] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uri, setUri] = useState("");

  const clickInnerModelHandler = (uri) => {
    setModalOpen(true);
    setUri(uri);
  };

  useEffect(() => {
    // viewer 생성
    const viewer = Viewer({
      terrain: new Cesium.Terrain(
        Cesium.CesiumTerrainProvider.fromUrl("http://localhost:8081/"),
      ),
      animation: false,
      baseLayerPicker: false,
      koreaHomeButton: true,
    });
    viewerRef.current = viewer;

    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    // add model entities
    const tecno = addModelEntity({
      viewer,
      position: tecnoModel.position,
      orientation: tecnoModel.orientation,
      modelInfo: tecnoModel.info,
    });

    const floors = [];

    floorsModel.forEach((element) => {
      const floor = addModelEntity({
        viewer,
        position: element.position,
        orientation: element.orientation,
        modelInfo: element.info,
      });

      floors.push(floor);
    });

    const modelGroup = new ModelGroup(tecno, floors);
    const { downPositionObj, upPositionObj } = getPositionObj(modelGroup);
    const modelGroupInfo = new ModelGroupInfo(
      modelGroup,
      downPositionObj,
      upPositionObj,
    );

    // model event handler
    const modelEvent = new ModelEvent({
      viewer,
      modelGroup,
      modelGroupInfo,
      clickInnerModelHandler,
    });
    modelEventRef.current = modelEvent;

    // measurement handler
    const drawer = new Drawer(viewer);
    drawerRef.current = drawer;

    return () => {
      viewer.destroy();
    };
  }, []);

  // Model
  useDidMountEffect(() => {
    if (!widgetAllClose) return;
    const modelEvent = modelEventRef.current;

    modelEvent.startEvent();

    return () => {
      modelEvent.stopEvent();
    };
  }, [viewerRef, widgetAllClose]);

  // Measurement
  useDidMountEffect(() => {
    const drawer = drawerRef.current;

    drawer.setWidgetState(widgetStateObj);
    drawer.drawingHandler();

    setWidgetAllClose(
      !distanceWidgetOpen && !radiusWidgetOpen && !areaWidgetOpen,
    );

    return () => {
      drawer.cleanUpDrawer();
    };
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen]);

  return (
    <>
      <Modal
        modalOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        filePath={uri}
      />
      <ToolBox />
    </>
  );
}
