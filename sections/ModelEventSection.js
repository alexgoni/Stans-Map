import { addModelEntity } from "@/components/handler/cesium/Entity";
import { getPositionObj } from "@/components/handler/cesium/ModelEventHandler";
import ModelEvent from "@/components/module/model/ModelEvent";
import {
  ModelGroup,
  ModelGroupInfo,
} from "@/components/module/model/ModelGroup";
import ThreeModal from "@/components/widget/ui/three/ThreeModal";
import { buildWidgetState } from "@/recoil/atom/BuildState";
import { measureEventOnState } from "@/recoil/atom/MeasurementState";
import { floorsModelState, technoModelState } from "@/recoil/atom/ModelState";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

export default function ModelEventSection({ viewer }) {
  const technoModel = useRecoilValue(technoModelState);
  const floorsModel = useRecoilValue(floorsModelState);
  const measureEventOn = useRecoilValue(measureEventOnState);
  const terrainEventOn = useRecoilValue(terrainWidgetState);
  const buildEventOn = useRecoilValue(buildWidgetState);
  const [isOpen, setIsOpen] = useState(false);
  const [uri, setUri] = useState("");
  const modelEventRef = useRef(null);

  const clickInnerModelHandler = (uri) => {
    setIsOpen(true);
    setUri(uri);
  };

  // 모델을 추가하고 ModelEvent 객체 생성
  useEffect(() => {
    // add model entities
    const techno = addModelEntity({
      viewer,
      position: technoModel.position,
      orientation: technoModel.orientation,
      modelInfo: technoModel.info,
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

    const modelGroup = new ModelGroup(techno, floors);
    // 모델 상하 이동 시 각각의 위치 계산
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

  // tool이 켜져있는지 확인하고 model에 대한 event 활성화
  useEffect(() => {
    const toolEvent = measureEventOn || terrainEventOn || buildEventOn;
    if (toolEvent) return;

    const modelEvent = modelEventRef.current;
    modelEvent.startEvent();

    return () => {
      modelEvent.stopEvent();
    };
  }, [measureEventOn, terrainEventOn, buildEventOn]);

  return (
    <ThreeModal
      isOpen={isOpen}
      closeModal={() => setIsOpen(false)}
      filePath={uri}
    />
  );
}
