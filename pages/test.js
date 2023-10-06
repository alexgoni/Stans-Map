import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect } from "react";
import * as Cesium from "cesium";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { defaultCamera, flyCamera } from "@/components/handler/cesium/Camera";
import { ModelGroup, ModelGroupInfo } from "@/components/module/ModelGroup";
import {
  downStateAtom,
  floorsModelState,
  tecnoModelState,
  upStateAtom,
} from "@/recoil/atom/ModelState";
import { useRecoilState, useRecoilValue } from "recoil";
import { getPositionObj } from "@/components/handler/cesium/ModelEvent";

export default function test() {
  const tecnoModel = useRecoilValue(tecnoModelState);

  const [upState, setUpState] = useRecoilState(upStateAtom);
  const [downState, setDownState] = useRecoilState(downStateAtom);

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

    // Camera 설정
    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    // tecno 생성
    const tecno = addModelEntity({
      viewer,
      position: tecnoModel.position,
      orientation: tecnoModel.orientation,
      modelInfo: tecnoModel.info,
    });

    // handler 선언
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // modelGroup, modelGroupInfo 생성
    const modelGroup = new ModelGroup(tecno);
    const { downPositionObj, upPositionObj } = getPositionObj(modelGroup);

    // left click event
    handler.setInputAction((click) => {
      setUpState(true);
      setDownState(false);
      function upAnimation(model) {
        let startTime = null;

        function animate(time) {
          if (!startTime) startTime = time;
          const progress = (time - startTime) / (1 * 1000);

          if (progress < 1) {
            const newPosition = new Cesium.Cartesian3();
            Cesium.Cartesian3.lerp(
              downPositionObj.outerPosition,
              upPositionObj.outerPosition,
              progress,
              newPosition,
            );
            model.position.setValue(newPosition);
            requestAnimationFrame(animate);
          }
        }

        requestAnimationFrame(animate);
      }

      upAnimation(tecno);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }, []);

  useEffect(() => {
    console.log("upstate : ", upState, "downstate : ", downState);
  }, [upState, downState]);

  return (
    <div
      id="cesiumContainer"
      className="m-0 h-screen w-screen overflow-hidden p-0"
    ></div>
  );
}
