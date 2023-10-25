import {
  createAreaPoint,
  createAreaPolygon,
  createLabel,
  createUnkinkedPolygon,
} from "@/components/handler/cesium/Entity";
import {
  calculateArea,
  getCoordinate,
  getRayPosition,
} from "@/components/handler/cesium/GeoInfo";
import * as Cesium from "cesium";

class AreaGroup {
  constructor(viewer) {
    this.viewer = viewer;
    this.pointEntityArr = [];
    this.pointPositionArr = [];
    this.turfPointPositionArr = [];
    this.polygonArr = [];
    this.area = 0;
    this.label = null;
  }

  addPointToViewer(position) {
    const point = createAreaPoint({
      viewer: this.viewer,
      position,
    });

    this.pointEntityArr.push(point);
    this.addPointAndTurfPosition(position);
  }

  addPointPosition(position) {
    this.pointPositionArr.push(position);
  }

  addTurfPointPosition(position) {
    this.turfPointPositionArr.push(getCoordinate(position));
  }

  addPointAndTurfPosition(position) {
    this.addPointPosition(position);
    this.addTurfPointPosition(position);
  }

  modifyTurfBeforeCalculate() {
    this.turfPointPositionArr = [
      ...this.turfPointPositionArr,
      this.turfPointPositionArr[0],
    ];
  }

  isPointCount(number) {
    return this.pointEntityArr.length === number;
  }

  removeLastPointPosition() {
    this.pointPositionArr.pop();
    this.turfPointPositionArr.pop();
    this.label.position = this.pointEntityArr.slice(-1)[0].position;
  }

  addPolygonToViewer() {
    this.polygonArr = createUnkinkedPolygon({
      viewer: this.viewer,
      turfPointPositionArr: this.turfPointPositionArr,
    });
  }

  addLabelToViewer(position) {
    this.label = createLabel({ viewer: this.viewer, position });
    this.label.label.text = "0.00 m²";
  }

  updateLabel() {
    function addCommasToNumber(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    let formattedArea;

    if (this.area >= 1000000) {
      const areaInSquareKilometers = this.area / 1000000;
      formattedArea =
        addCommasToNumber(areaInSquareKilometers.toFixed(2)) + " km²";
    } else {
      formattedArea = addCommasToNumber(this.area.toFixed(2)) + " m²";
    }

    this.label.label.text = new Cesium.CallbackProperty(() => {
      return formattedArea;
    }, false);
  }

  calculateAreaAndUpdateLabel() {
    this.area = calculateArea(this.turfPointPositionArr);
    this.updateLabel();
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

  resetAreaGroup() {
    this.areaGroup = new AreaGroup(this.viewer);
    this.viewer.entities.remove(this.floatingPoint);
    this.viewer.entities.remove(this.activeShape);

    this.floatingPoint = null;
    this.activeShape = null;
  }

  clearAreaGroupArr() {
    this.areaGroupArr.forEach((areaGroup) => {
      areaGroup.polygonArr.forEach((entity) => {
        this.viewer.entities.remove(entity);
      });
      areaGroup.pointEntityArr.forEach((entity) => {
        this.viewer.entities.remove(entity);
      });
      this.viewer.entities.remove(areaGroup.label);
    });

    this.areaGroupArr = [];
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;

    if (this.areaGroup.isPointCount(0)) {
      this.floatingPoint = createAreaPoint({
        viewer: this.viewer,
        position: clickPosition,
      });

      this.areaGroup.addPointAndTurfPosition(clickPosition);
      this.areaGroup.addLabelToViewer(this.floatingPoint.position);

      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return new Cesium.PolygonHierarchy(this.areaGroup.pointPositionArr);
      }, false);

      //////////////////////////////

      this.activeShape = createAreaPolygon({
        viewer: this.viewer,
        hierarchy: dynamicPositions,
      });

      //////////////////////////////
    }

    this.areaGroup.addPointToViewer(clickPosition);
  }

  onMouseMove(movement) {
    if (!Cesium.defined(this.floatingPoint)) return;

    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });

    if (Cesium.defined(newPosition)) {
      this.floatingPoint.position.setValue(newPosition);

      this.areaGroup.pointPositionArr.pop();
      this.areaGroup.pointPositionArr.push(newPosition);

      this.areaGroup.turfPointPositionArr.pop();
      this.areaGroup.turfPointPositionArr.push(getCoordinate(newPosition));

      if (this.areaGroup.turfPointPositionArr.length < 3) return;

      this.areaGroup.modifyTurfBeforeCalculate();
      this.areaGroup.calculateAreaAndUpdateLabel();
      this.areaGroup.turfPointPositionArr.pop();
    }
  }

  onRightClick() {
    if (!Cesium.defined(this.floatingPoint)) return;

    // movement event에서 마지막으로 push된 element 제거
    this.areaGroup.removeLastPointPosition();

    if (this.areaGroup.pointEntityArr.length <= 2) {
      this.viewer.entities.remove(this.areaGroup.pointEntityArr[0]);
      this.viewer.entities.remove(this.areaGroup.pointEntityArr[1]);
      this.viewer.entities.remove(this.areaGroup.label);
    } else {
      this.areaGroup.addPolygonToViewer();

      // 시작점과 끝점이 일치되어야 함
      this.areaGroup.modifyTurfBeforeCalculate();
      this.areaGroup.calculateAreaAndUpdateLabel();

      this.areaGroupArr.push(this.areaGroup);
    }

    this.resetAreaGroup();
  }
}
