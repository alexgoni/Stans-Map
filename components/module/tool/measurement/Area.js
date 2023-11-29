import {
  createAreaPoint,
  createAreaPolyline,
  createLabel,
  createKinkedPolygon,
} from "@/components/handler/cesium/Entity";
import {
  calculateArea,
  getCoordinate,
  getRayPosition,
} from "@/components/handler/cesium/GeoInfo";
import * as Cesium from "cesium";
import { ShapeGroup, ShapeController } from "./Shape";

class AreaGroup extends ShapeGroup {
  constructor(viewer) {
    super(viewer);
    this.turfPointPositionArr = [];
    this.polygonArr = [];
    this.area = this.value;
  }

  addPointToViewer(position) {
    const point = createAreaPoint({
      viewer: this.viewer,
      position,
    });

    this.pointEntityArr.push(point);
    this.addPointAndTurfPosition(position);
  }

  addPointAndTurfPosition(position) {
    this.#addPointPosition(position);
    this.#addTurfPointPosition(position);
  }

  get pointEntityNum() {
    return this.pointEntityArr.length;
  }

  removeLastPointPosition() {
    this.pointPositionArr.pop();
    this.turfPointPositionArr.pop();
    this.label.position = this.pointEntityArr.slice(-1)[0].position;
  }

  addPolygonToViewer() {
    this.polygonArr = createKinkedPolygon({
      viewer: this.viewer,
      turfPointPositionArr: this.turfPointPositionArr,
    });
  }

  addLabelToViewer(position) {
    this.label = createLabel({ viewer: this.viewer, position });
    this.label.label.text = "0.00 m²";
  }

  calculateAreaAndUpdateLabel() {
    const modifiedTurfArr = [
      ...this.turfPointPositionArr,
      this.turfPointPositionArr[0],
    ];
    this.area = calculateArea(modifiedTurfArr);
    this.#updateLabel();
  }

  #addPointPosition(position) {
    this.pointPositionArr.push(position);
  }

  #addTurfPointPosition(position) {
    this.turfPointPositionArr.push(getCoordinate(position));
  }

  #updateLabel() {
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
}

export default class AreaController extends ShapeController {
  constructor(viewer) {
    super(viewer);
    this.activeShape = null;

    this.areaGroup = new AreaGroup(this.viewer);
    this.areaGroupArr = [];
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

    const areaGroupFirstClickHandler = () => {
      this.floatingPoint = createAreaPoint({
        viewer: this.viewer,
        position: clickPosition,
      });

      this.areaGroup.addPointAndTurfPosition(clickPosition);
      this.areaGroup.addLabelToViewer(this.floatingPoint.position);

      const dynamicPositions = new Cesium.CallbackProperty(() => {
        if (this.areaGroup.pointEntityArr.length < 2)
          return this.areaGroup.pointPositionArr.flat();
        const clonePointPositonArr = [...this.areaGroup.pointPositionArr];
        clonePointPositonArr.push(clonePointPositonArr[0]);
        return clonePointPositonArr.flat();
      }, false);

      this.activeShape = createAreaPolyline({
        viewer: this.viewer,
        positions: dynamicPositions,
      });
    };

    if (this.areaGroup.pointEntityNum === 0) areaGroupFirstClickHandler();
    this.areaGroup.addPointToViewer(clickPosition);
  }

  onMouseMove(movement) {
    if (!Cesium.defined(this.floatingPoint)) return;

    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });
    if (!Cesium.defined(newPosition)) return;

    const updatePositionArr = () => {
      this.areaGroup.pointPositionArr.pop();
      this.areaGroup.pointPositionArr.push(newPosition);

      this.areaGroup.turfPointPositionArr.pop();
      this.areaGroup.turfPointPositionArr.push(getCoordinate(newPosition));
    };
    // floating point 위치 변경
    this.floatingPoint.position.setValue(newPosition);

    updatePositionArr();

    // update area
    if (this.areaGroup.pointEntityNum < 2) return;
    this.areaGroup.calculateAreaAndUpdateLabel();
  }

  onRightClick() {
    if (!Cesium.defined(this.floatingPoint)) return;

    // movement event에서 마지막으로 push된 element 제거
    this.areaGroup.removeLastPointPosition();

    const removeInvalidEntitiesFromPolygon = () => {
      this.viewer.entities.remove(this.areaGroup.pointEntityArr[0]);
      this.viewer.entities.remove(this.areaGroup.pointEntityArr[1]);
      this.viewer.entities.remove(this.areaGroup.label);
    };

    const areaGroupEndEvent = () => {
      this.areaGroup.addPolygonToViewer();
      this.areaGroup.calculateAreaAndUpdateLabel();
      this.areaGroupArr.push(this.areaGroup);
    };

    if (this.areaGroup.pointEntityNum <= 2) removeInvalidEntitiesFromPolygon();
    else areaGroupEndEvent();

    this.resetAreaGroup();
  }
}
