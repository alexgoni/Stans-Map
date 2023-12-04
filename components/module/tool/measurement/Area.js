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
import { ShapeGroup, ShapeController, ShapeLayer } from "./Shape";
import { areaFormatter } from "../../formatter";

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

  toggleShow(showState) {
    this.pointEntityArr.forEach((entity) => {
      entity.show = showState;
    });
    this.polygonArr.forEach((entity) => {
      entity.show = showState;
    });
    this.label.show = showState;
  }

  get pointEntityNum() {
    return this.pointEntityArr.length;
  }

  #addPointPosition(position) {
    this.pointPositionArr.push(position);
  }

  #addTurfPointPosition(position) {
    this.turfPointPositionArr.push(getCoordinate(position));
  }

  #updateLabel() {
    this.label.label.text = new Cesium.CallbackProperty(() => {
      return areaFormatter(this.area, 2);
    }, false);
  }
}

class AreaStack extends ShapeLayer {
  constructor(viewer) {
    super(viewer);
  }

  updateData(areaGroup) {
    if (!this._readData) return;
    const data = {
      id: areaGroup.id,
      name: areaGroup.name,
      value: areaGroup.area,
    };
    this.dataStack.push(data);
    this._readData([...this.dataStack]);
  }

  toggleShowAreaGroup(areaGroupArr, id, showState) {
    areaGroupArr.forEach((areaGroup) => {
      if (areaGroup.id !== id) return;
      areaGroup.toggleShow(showState);
    });
  }

  zoomToAreaGroup(areaGroupArr, id) {
    areaGroupArr.forEach((areaGroup) => {
      if (areaGroup.id !== id) return;
      const offset = new Cesium.HeadingPitchRange(...ShapeLayer.OFFSET);
      this.viewer.zoomTo(areaGroup.label, offset);
    });
  }

  deleteAreaGroup(areaGroupArr, id) {
    return areaGroupArr.filter((areaGroup) => {
      if (areaGroup.id !== id) return true;
      else {
        this.#deleteAreaGroupEntities(areaGroup);
        return false;
      }
    });
  }

  #deleteAreaGroupEntities(areaGroup) {
    areaGroup.polygonArr.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    areaGroup.pointEntityArr.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    this.viewer.entities.remove(areaGroup.label);
  }
}

export default class AreaController extends ShapeController {
  static nextId = 1;

  constructor(viewer) {
    super(viewer);
    this.activeShape = null;
    this.areaGroup = new AreaGroup(viewer);
    this.areaGroupArr = [];
    this.areaStack = new AreaStack(viewer);
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;

    if (this.areaGroup.pointEntityNum === 0) {
      this.#areaGroupFirstClickHandler(clickPosition);
    }
    this.areaGroup.addPointToViewer(clickPosition);
  }

  onMouseMove(movement) {
    if (!Cesium.defined(this.floatingPoint)) return;

    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });
    if (!Cesium.defined(newPosition)) return;

    this.floatingPoint.position.setValue(newPosition);
    this.#updatePositionArr(newPosition);

    // update area
    if (this.areaGroup.pointEntityNum < 2) return;
    this.areaGroup.calculateAreaAndUpdateLabel();
  }

  onRightClick() {
    if (!Cesium.defined(this.floatingPoint)) return;

    // movement event에서 마지막으로 push된 element 제거
    this.areaGroup.removeLastPointPosition();

    if (this.areaGroup.pointEntityNum <= 2) {
      this.#removeInvalidEntitiesFromPolygon();
    } else this.#areaGroupEndEvent();

    this.resetAreaGroup();
  }

  resetAreaGroup() {
    this.areaGroup = new AreaGroup(this.viewer);
    this.viewer.entities.remove(this.floatingPoint);
    this.viewer.entities.remove(this.activeShape);

    this.floatingPoint = null;
    this.activeShape = null;
  }

  forceReset() {
    if (this.areaGroup.pointEntityNum <= 2) {
      this.#removeInvalidEntitiesFromPolygon();
    } else this.areaGroupArr.push(this.areaGroup);

    this.resetAreaGroup();
    this.#clearAreaGroupArr();
  }

  toggleShowGroup(id, showState) {
    this.areaStack.toggleShowAreaGroup(this.areaGroupArr, id, showState);
  }

  zoomToGroup(id) {
    this.areaStack.zoomToAreaGroup(this.areaGroupArr, id);
  }

  deleteGroup(id) {
    this.areaGroupArr = this.areaStack.deleteAreaGroup(this.areaGroupArr, id);
  }

  #areaGroupFirstClickHandler(clickPosition) {
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
  }

  #updatePositionArr(newPosition) {
    this.areaGroup.pointPositionArr.pop();
    this.areaGroup.pointPositionArr.push(newPosition);

    this.areaGroup.turfPointPositionArr.pop();
    this.areaGroup.turfPointPositionArr.push(getCoordinate(newPosition));
  }

  #removeInvalidEntitiesFromPolygon() {
    this.viewer.entities.remove(this.areaGroup.pointEntityArr[0]);
    this.viewer.entities.remove(this.areaGroup.pointEntityArr[1]);
    this.viewer.entities.remove(this.areaGroup.label);
  }

  #areaGroupEndEvent() {
    this.areaGroup.addPolygonToViewer();
    this.areaGroup.calculateAreaAndUpdateLabel();
    this.areaGroup.id = AreaController.nextId;
    this.areaGroup.name = `Area ${AreaController.nextId++}`;
    this.areaGroupArr.push(this.areaGroup);
    this.areaStack.updateData(this.areaGroup);
  }

  #clearAreaGroupArr() {
    this.areaGroupArr.forEach((areaGroup) => {
      this.#deleteAreaGroupEntities(areaGroup);
    });

    this.areaGroupArr = [];
    this.areaStack.dataStack = [];
  }

  #deleteAreaGroupEntities(areaGroup) {
    areaGroup.polygonArr.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    areaGroup.pointEntityArr.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    this.viewer.entities.remove(areaGroup.label);
  }
}
