import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { defaultCamera, flyCamera } from "@/components/handler/cesium/Camera";
import { ModelGroup, ModelGroupInfo } from "@/components/module/ModelGroup";
import {
  getPositionObj,
  groupDownAnimation,
  holdView,
  hoverToOpacityChange,
  isInnerModelClicked,
  leftClickToUp,
  rightClickToDown,
  unholdView,
} from "@/components/handler/cesium/ModelEvent";
import { InfoBox, popUpInfo } from "@/components/widget/InfoBox";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { MeasureWidget, pointEvent } from "@/components/widget/Measure";
import Modal from "@/components/widget/Modal";

export default function POC() {
  /* 
    Event

    모델 좌클릭 : {모델 up, 시점 고정}, 팝업창
    모델 우클릭 : {모델 down, 시점 고정 해제}
    팝업 close : 모델 down, 시점 고정 해제
    땅 좌클릭 : {시점 고정 해제}
    모델 hover : {opacity 변경}
    Floor 좌클릭 : {모달 오픈} 
  */
  const upState = useRef(false);
  const downState = useRef(true);
  const viewerRef = useRef(null);
  const modelGroupInfoRef = useRef(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [uri, setUri] = useState("");
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [surfaceDistance, setSurfaceDistance] = useState(0);

  useEffect(() => {
    const geomap = new Cesium.WebMapServiceImageryProvider({
      url: "http://192.168.1.45:8188/geoserver/wms",
      parameters: {
        format: "image/png",
        transparent: "true",
        tiled: true,
        enablePickFeatures: true,
      },
      layers: "stans:protoMap",
      maximumLevel: 20,
    });

    // viewer 생성
    const viewer = Viewer({
      img: geomap,
      animation: false,
      baseLayerPicker: false,
    });

    // homeButton event
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      (event) => {
        event.cancel = true;
        flyCamera(viewer, [127.5, 37.512, 1_500_000]);
      },
    );

    // 충돌 무시
    // viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewerRef.current = viewer;

    // Camera 설정
    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    // tecno 생성
    const tecnoPosition = [127.08049, 37.63457, 0];
    const tecnoOrientation = [105, 0, 0];
    const tecnoInfo = {
      name: "Tecno Building",
      description: "STANS 4th floor",
      model: {
        uri: "/glb/tecno.glb",
        scale: 0.01,
      },
    };
    const tecno = addModelEntity({
      viewer,
      position: tecnoPosition,
      orientation: tecnoOrientation,
      modelInfo: tecnoInfo,
    });

    // floors 생성
    const floorPosition = [127.08081, 37.63456, 15];
    const floorOrientation = [16, 0, 0];

    const minFloor = 3;
    const maxFloor = 5;
    const floors = [];

    for (let i = minFloor; i <= maxFloor; i++) {
      const floorInfo = {
        description: `${i}th Floor`,
        model: {
          uri: `/glb/Floor${i}.glb`,
          scale: 1.2,
          color: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.0),
        },
      };

      const floor = addModelEntity({
        viewer,
        position: floorPosition,
        orientation: floorOrientation,
        modelInfo: floorInfo,
      });

      floors.push(floor);
    }

    // modelGroup, modelGroupInfo 생성
    const modelGroup = new ModelGroup(tecno, floors);
    const { downPositionObj, upPositionObj } = getPositionObj(modelGroup);
    const modelGroupInfo = new ModelGroupInfo(
      modelGroup,
      downPositionObj,
      upPositionObj,
      upState,
      downState,
    );

    modelGroupInfoRef.current = modelGroupInfo;

    // handler 선언
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // left click event
    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);

      // 모델 up
      leftClickToUp({
        pickedObject,
        ...modelGroupInfo,
      });

      // 시점 고정
      holdView(viewer, pickedObject, tecno);

      // innerModel click event
      if (upState.current)
        isInnerModelClicked({
          pickedObject,
          innerModel: floors,
          setModalIsOpen,
          setUri,
        });

      // infoBox 팝업
      popUpInfo({ pickedObject, model: tecno });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // right click event
    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);

      // 모델 down
      rightClickToDown({ pickedObject, ...modelGroupInfo });

      // 시점 고정 해제
      unholdView(viewer, pickedObject, tecno);

      // popup close
      document.querySelector("#info").style.display = "none";
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // hover event
    handler.setInputAction((movement) => {
      hoverToOpacityChange({ viewer, movement, modelGroup });
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      viewer.destroy();
      handler.destroy();
      upState.current = false;
      downState.current = true;
    };
  }, []);

  // Measure
  useDidMountEffect(() => {
    const viewer = viewerRef.current;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    pointEvent({ viewer, handler, widgetOpen, setSurfaceDistance });

    return () => {
      handler.destroy();
      cesiumContainer.style.cursor = "default";
    };
  }, [widgetOpen]);

  // 내부로 들어갔을 때 measure widget과 pop up 창 닫기
  useDidMountEffect(() => {
    if (modalIsOpen) {
      setWidgetOpen(false);
      document.querySelector("#info").style.display = "none";
    }
  }, [modalIsOpen]);

  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      <InfoBox
        closeEvent={() => groupDownAnimation({ ...modelGroupInfoRef.current })}
      />
      <Modal
        modalIsOpen={modalIsOpen}
        closeModal={() => setModalIsOpen(false)}
        filePath={uri}
      />
      <MeasureWidget
        widgetOpen={widgetOpen}
        setWidgetOpen={setWidgetOpen}
        surfaceDistance={surfaceDistance}
      />
    </>
  );
}
