import { Viewer } from "@/components/handler/cesium/Viewer";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { defaultCamera, flyCamera } from "@/components/handler/cesium/Camera";
import { ModelGroup, ModelGroupInfo } from "@/components/module/ModelGroup";
import {
  getPositionObj,
  groupDownAnimation,
  groupUpAnimation,
  holdView,
  hoverToOpacityChange,
  isInnerModelClicked,
  unholdView,
} from "@/components/handler/cesium/ModelEventHandler";
import { InfoBox, popUpInfo } from "@/components/widget/InfoBox";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { MeasureWidget, pointEvent } from "@/components/widget/Measure";
import Modal from "@/components/widget/Modal";
import { floorsModelState, tecnoModelState } from "@/recoil/atom/ModelState";
import { useRecoilValue } from "recoil";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import Drawer from "@/components/module/measurement/Drawer";
import ToolBox from "@/components/widget/measurement/ToolBox";

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

  const drawerRef = useRef(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [uri, setUri] = useState("");
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [surfaceDistance, setSurfaceDistance] = useState(0);

  let upState = false;
  let downState = true;

  const viewerRef = useRef(null);
  const modelGroupInfoRef = useRef(null);

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

  useEffect(() => {
    const viewer = Viewer({
      terrain: new Cesium.Terrain(
        Cesium.CesiumTerrainProvider.fromUrl("http://localhost:8081/"),
      ),
      img: geomap,
      animation: false,
      baseLayerPicker: false,
      koreaHomeButton: true,
    });
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewerRef.current = viewer;

    // Camera 설정
    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    const drawer = new Drawer(viewer);
    drawerRef.current = drawer;

    // tecno 생성
    const tecno = addModelEntity({
      viewer,
      position: tecnoModel.position,
      orientation: tecnoModel.orientation,
      modelInfo: tecnoModel.info,
    });

    // floors 생성
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

    // modelGroup, modelGroupInfo 생성
    const modelGroup = new ModelGroup(tecno, floors);
    const { downPositionObj, upPositionObj } = getPositionObj(modelGroup);
    const modelGroupInfo = new ModelGroupInfo(
      modelGroup,
      downPositionObj,
      upPositionObj,
    );

    modelGroupInfoRef.current = modelGroupInfo;

    // handler 선언
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // left click event
    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);

      if (
        Cesium.defined(pickedObject) &&
        pickedObject.id === modelGroup.outerModel
      ) {
        downState
          ? (() => {
              // 모델 up
              groupUpAnimation(modelGroupInfo);
              downState = false;
              upState = true;
            })()
          : null;

        // infoBox 팝업
        popUpInfo({ pickedObject, model: tecno });
      }

      // 시점 고정
      holdView(viewer, pickedObject, tecno);

      // 건물이 떠있는 상태에서 내부 건물 클릭 허용
      isInnerModelClicked({
        pickedObject,
        innerModel: floors,
        setModalIsOpen,
        setUri,
      });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // right click event
    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);

      if (
        Cesium.defined(pickedObject) &&
        pickedObject.id === modelGroup.outerModel
      ) {
        upState
          ? (() => {
              // 모델 down
              groupDownAnimation(modelGroupInfo);
              downState = true;
              upState = false;
            })()
          : null;

        // 시점 고정 해제
        unholdView(viewer, pickedObject, tecno);

        // popup close
        document.querySelector("#info").style.display = "none";
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // hover event
    handler.setInputAction((movement) => {
      hoverToOpacityChange({ viewer, movement, modelGroup });
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      viewer.destroy();
      handler.destroy();
      document.querySelector("#info").style.display = "none";
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

  // 내부로 들어갔을 때 measure widget과 pop up 창 닫기
  useDidMountEffect(() => {
    if (modalIsOpen) {
      setWidgetOpen(false);
      document.querySelector("#info").style.display = "none";
    }
  }, [modalIsOpen]);

  return (
    <>
      <InfoBox
        closeEvent={() => {
          groupDownAnimation(modelGroupInfoRef.current);
          upState = false;
          downState = true;
        }}
      />
      <Modal
        modalIsOpen={modalIsOpen}
        closeModal={() => setModalIsOpen(false)}
        filePath={uri}
      />
      <ToolBox />
    </>
  );
}
