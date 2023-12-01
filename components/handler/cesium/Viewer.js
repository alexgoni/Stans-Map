import * as Cesium from "cesium";
import { flyCamera } from "./Camera";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";

function Viewer({
  terrain = undefined,
  terrainProvider = undefined,
  selectionIndicator = false,
  infoBox = false,
  timeline = false,
  animation = false,
  shouldAnimate = false,
  navigationHelpButton = false,
  geocoder = false,
  baseLayerPicker = false,
  baseLayer = undefined,
  homeButton = true,
  koreaHomeButton = false,
  scene3DOnly = true,
  fullscreenButton = false,
} = {}) {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain,
    terrainProvider,
    selectionIndicator,
    infoBox,
    timeline,
    animation,
    shouldAnimate,
    navigationHelpButton,
    geocoder,
    baseLayerPicker,
    homeButton,
    scene3DOnly,
    fullscreenButton,
    /* offline default imageLayer
    추가되는 이미지가 있는 경우
    baseLayer: false 
    or
    추가되는 이미지가 없는 경우 default 값
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      Cesium.TileMapServiceImageryProvider.fromUrl(
        Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
      ),
    ),
    */
  });

  // imageLayer 설정
  if (baseLayer !== undefined) {
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(baseLayer);
  }

  // homeButton event
  if (koreaHomeButton) {
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      (event) => {
        event.cancel = true;
        flyCamera(viewer, [127.5, 37.512, 1_500_000]);
      },
    );
  }

  // 최대 확대 제한
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 6378137 * 5;

  // double click event 지우기
  viewer.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
  );

  // Cesium 하단 로고 지우기
  const cesiumViewerBottom = document.querySelector(".cesium-viewer-bottom");
  if (cesiumViewerBottom) {
    cesiumViewerBottom.remove();
  }

  // 충돌 무시
  // viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

  return viewer;
}

function CursorHandler({ viewer }) {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const areaWidgetOpen = useRecoilValue(areaWidgetState);
  const terrainWidgetOpen = useRecoilValue(terrainWidgetState);

  useEffect(() => {
    if (
      distanceWidgetOpen ||
      radiusWidgetOpen ||
      areaWidgetOpen ||
      terrainWidgetOpen
    ) {
      viewer.container.style.cursor = "crosshair";
    } else {
      viewer.container.style.cursor = "default";
    }
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen, terrainWidgetOpen]);
}

export { Viewer, CursorHandler };
