import {
  createAreaPoint,
  createAreaPolygon,
} from "@/components/handler/cesium/Entity";
import {
  calculateArea,
  getCoordinate,
  getRayPosition,
} from "@/components/handler/cesium/measurement/GeoInfo";
import * as Cesium from "cesium";

export default class AreaDrawer {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.floatingPoint = null;
    this.shapePointCoordinateArr = [];
    this.activeShape = null;
    this.pointArr = [];
    this.turfPointCoordinateArr = [];

    this.onLeftClick = this.onLeftClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onRightClick = this.onRightClick.bind(this);
  }

  startDrawing() {
    this.handler.setInputAction(
      this.onLeftClick,
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
    this.handler.setInputAction(
      this.onMouseMove,
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );
    this.handler.setInputAction(
      this.onRightClick,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK,
    );
  }

  stopDrawing() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });

    if (!Cesium.defined(clickPosition)) return;
    const [longitude, latitude] = getCoordinate(clickPosition);
    this.turfPointCoordinateArr.push([longitude, latitude]);

    // first click
    if (this.shapePointCoordinateArr.length === 0) {
      this.floatingPoint = createAreaPoint({
        viewer: this.viewer,
        position: clickPosition,
      });
      this.shapePointCoordinateArr.push(clickPosition);

      // first click시 activeShapePoints를 감시해 PolygonHierarchy를 리턴하는 콜백 함수 등록
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return new Cesium.PolygonHierarchy(this.shapePointCoordinateArr);
      }, false);

      this.activeShape = createAreaPolygon({
        viewer: this.viewer,
        hierarchy: dynamicPositions,
      });
    }
    const point = createAreaPoint({
      viewer: this.viewer,
      position: clickPosition,
    });
    this.shapePointCoordinateArr.push(clickPosition);
    this.pointArr.push(point);
  }

  onMouseMove(movement) {
    // first click 이후 movement 이벤트
    if (!Cesium.defined(this.floatingPoint)) return;
    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });
    if (Cesium.defined(newPosition)) {
      this.floatingPoint.position.setValue(newPosition);
      // 마우스가 움직일때마다 이전 위치 pop, 새로운 위치 push
      this.shapePointCoordinateArr.pop();
      this.shapePointCoordinateArr.push(newPosition);
    }
  }

  onRightClick() {
    // first click 이후 rightClick 이벤트
    if (!Cesium.defined(this.floatingPoint)) return;
    this.shapePointCoordinateArr.pop();
    if (this.pointArr.length > 2) {
      // 시작점과 끝점이 일치되어야 함
      this.turfPointCoordinateArr.push(this.turfPointCoordinateArr[0]);
      createAreaPolygon({
        viewer: this.viewer,
        hierarchy: this.shapePointCoordinateArr,
      });
      const area = calculateArea(this.turfPointCoordinateArr);
      console.log(`폴리곤의 면적: ${area} 제곱미터`);
    } else {
      this.pointArr.forEach((element) => {
        this.viewer.entities.remove(element);
      });
    }

    this.viewer.entities.remove(this.floatingPoint);
    this.viewer.entities.remove(this.activeShape);

    this.floatingPoint = null;
    this.activeShape = null;
    this.shapePointCoordinateArr = [];
    this.pointArr = [];
    this.turfPointCoordinateArr = [];
  }
}
