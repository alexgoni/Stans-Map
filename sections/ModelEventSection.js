import { addModelEntity } from "@/components/handler/cesium/Entity";
import { getPositionObj } from "@/components/handler/cesium/ModelEventHandler";
import ModelEvent from "@/components/module/model/ModelEvent";
import {
  ModelGroup,
  ModelGroupInfo,
} from "@/components/module/model/ModelGroup";
import Modal from "@/components/widget/Modal";
import { measureEventOnState } from "@/recoil/atom/MeasurementState";
import { floorsModelState, tecnoModelState } from "@/recoil/atom/ModelState";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

export default function ModelEventSection({ viewer }) {
  const tecnoModel = useRecoilValue(tecnoModelState);
  const floorsModel = useRecoilValue(floorsModelState);
  const measureEventOn = useRecoilValue(measureEventOnState);
  const terrainEventOn = useRecoilValue(terrainWidgetState);
  const [modalOpen, setModalOpen] = useState(false);
  const [uri, setUri] = useState("");
  const modelEventRef = useRef(null);

  const clickInnerModelHandler = (uri) => {
    setModalOpen(true);
    setUri(uri);
  };

  useEffect(() => {
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

    return () => {
      modelEvent.stopEvent();
    };
  }, []);

  // Model
  useEffect(() => {
    if (measureEventOn || terrainEventOn) return;

    const modelEvent = modelEventRef.current;
    modelEvent.startEvent();

    return () => {
      modelEvent.stopEvent();
    };
  }, [measureEventOn, terrainEventOn]);

  return (
    <Modal
      modalOpen={modalOpen}
      closeModal={() => setModalOpen(false)}
      filePath={uri}
    />
  );
}
