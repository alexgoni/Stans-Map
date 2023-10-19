import * as Cesium from "cesium";
import { calculateRadius, getRayPosition } from "./GeoInfo";
import CircleGroup from "@/components/class/Circle";

/**
 *
 * @description 'circleGroupArr' should be declared externally.
 */
function circleDrawingHandler({
  viewer,
  handler,
  radiusWidgetOpen,
  circleGroupArr,
  setCircleGroupArr,
}) {
  // Click Flag
  let initClick = true;
  let circleGroup = null;

  if (radiusWidgetOpen) {
    handler.setInputAction((click) => {
      const clickPosition = getRayPosition({
        viewer,
        position: click.position,
      });
      if (Cesium.defined(clickPosition)) {
        if (initClick) {
          initClick = false;
          let surfaceDistance = 0;

          circleGroup = new CircleGroup(viewer, clickPosition);

          circleGroup.updateLabel(
            new Cesium.CallbackProperty(() => {
              if (surfaceDistance >= 1000) {
                return `${(surfaceDistance / 1000).toFixed(2)}km`;
              } else {
                return `${surfaceDistance.toFixed(2)}m`;
              }
            }, false),
          );

          handler.setInputAction((movement) => {
            const movePosition = getRayPosition({
              viewer,
              position: movement.endPosition,
            });
            if (Cesium.defined(movePosition)) {
              surfaceDistance = calculateRadius(clickPosition, movePosition);
              circleGroup.updateRadius(surfaceDistance);
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        } else {
          // mouse move event 제거
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
          // Click Flag 초기화
          initClick = true;

          setCircleGroupArr((prevArr) => [...prevArr, circleGroup]);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  } else {
    circleGroupArr.forEach((circleGroup) => circleGroup.destroy());
    // 빈 배열로 초기화
    setCircleGroupArr([]);
  }
}

export { circleDrawingHandler };
