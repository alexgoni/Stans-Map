import * as Cesium from "cesium";

export default function Viewer({
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

  return viewer;
}
