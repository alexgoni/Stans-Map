import * as Cesium from "cesium";
import { flyCamera } from "./Camera";

function Viewer({
  terrain = undefined,
  selectionIndicator = false,
  infoBox = false,
  timeline = false,
  animation = true,
  shouldAnimate = false,
  navigationHelpButton = false,
  geocoder = false,
  baseLayerPicker = true,
  img = undefined,
  koreaHomeButton = false,
} = {}) {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrain: terrain,
    selectionIndicator: selectionIndicator,
    infoBox: infoBox,
    timeline: timeline,
    animation: animation,
    shouldAnimate: shouldAnimate,
    navigationHelpButton: navigationHelpButton,
    geocoder: geocoder,
    baseLayerPicker: baseLayerPicker,
  });

  // imageLayer 설정
  if (img !== undefined) {
    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(img);
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

function cursorHandler(viewer, widgetStateObj) {
  const { distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen } =
    widgetStateObj;
  if (distanceWidgetOpen || radiusWidgetOpen || areaWidgetOpen) {
    viewer.container.style.cursor = "crosshair";
  } else {
    viewer.container.style.cursor = "default";
  }
}

export { Viewer, cursorHandler };
