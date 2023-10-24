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

class AreaGroup {
  constructor(viewer) {
    this.viewer = viewer;
    this.shapePointPositionArr = [];
    this.pointArr = [];
    this.turfPointPositionArr = [];
    this.polygon = null;
  }

  addPoint(point) {
    this.pointArr.push(point);
  }

  addShapePointPosition(position) {
    this.shapePointPositionArr.push(position);
  }

  addTurfPointPosition(position) {
    this.turfPointPositionArr.push(position);
  }

  addPointPosition(position) {
    this.addShapePointPosition(position);
    this.addTurfPointPosition(getCoordinate(position));
  }
}

export default class AreaDrawer {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.floatingPoint = null;
    this.activeShape = null;

    this.areaGroup = new AreaGroup(this.viewer);
    this.areaGroupArr = [];

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

  clearLineGroupArr() {
    this.areaGroupArr.forEach((areaGroup) => {
      this.viewer.entities.remove(areaGroup.polygon);
      areaGroup.pointArr.forEach((entity) => {
        this.viewer.entities.remove(entity);
      });
    });

    this.areaGroupArr = [];
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;
    // first click
    if (this.areaGroup.pointArr.length === 0) {
      this.floatingPoint = createAreaPoint({
        viewer: this.viewer,
        position: clickPosition,
      });
      this.areaGroup.addShapePointPosition(clickPosition);

      // first click시 activeShapePoints를 감시해 PolygonHierarchy를 리턴하는 콜백 함수 등록
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return new Cesium.PolygonHierarchy(
          this.areaGroup.shapePointPositionArr,
        );
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
    this.areaGroup.addPoint(point);
    this.areaGroup.addPointPosition(clickPosition);
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
      this.areaGroup.shapePointPositionArr.pop();
      this.areaGroup.shapePointPositionArr.push(newPosition);
    }
  }

  onRightClick() {
    // first click 이후 rightClick 이벤트
    if (!Cesium.defined(this.floatingPoint)) return;
    this.areaGroup.shapePointPositionArr.pop();
    if (this.areaGroup.pointArr.length > 2) {
      // 시작점과 끝점이 일치되어야 함
      this.areaGroup.turfPointPositionArr.push(
        this.areaGroup.turfPointPositionArr[0],
      );
      const polygon = createAreaPolygon({
        viewer: this.viewer,
        hierarchy: this.areaGroup.shapePointPositionArr,
      });
      this.areaGroup.polygon = polygon;
      const area = calculateArea(this.areaGroup.turfPointPositionArr);
      console.log(`폴리곤의 면적: ${area} 제곱미터`);

      this.areaGroupArr.push(this.areaGroup);
    } else {
      this.pointArr.forEach((element) => {
        this.viewer.entities.remove(element);
      });
    }

    this.viewer.entities.remove(this.floatingPoint);
    this.viewer.entities.remove(this.activeShape);

    this.floatingPoint = null;
    this.activeShape = null;
    this.areaGroup = new AreaGroup(this.viewer);
  }
}
