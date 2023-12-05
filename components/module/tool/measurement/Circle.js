import {
  createCenterPoint,
  createCircle,
  createLabel,
} from "@/components/handler/cesium/Entity";
import {
  calculateRadius,
  getRayPosition,
} from "@/components/handler/cesium/GeoInfo";
import * as Cesium from "cesium";
import { ShapeGroup, ShapeController, ShapeLayer } from "./Shape";
import { formatByMeter } from "../../lib/formatter";

class CircleGroup extends ShapeGroup {
  constructor(viewer) {
    super(viewer);
    this.centerPosition = null;
    this.centerPoint = null;
    this.circle = null;
    this.radius = this.value;
  }

  addCircleGroupToViewer() {
    this.#addPointerToViewer();
    this.#addCircleToViewer();
    this.#addLabelToViewer();
  }

  registerCircleGroupCallback() {
    this.#registerRadiusCallBack(this.radius);
    this.#registerLabelCallBack(this.radius);
  }

  toggleShow(showState) {
    this.centerPoint.show = showState;
    this.circle.show = showState;
    this.label.show = showState;
  }

  #addPointerToViewer() {
    this.centerPoint = createCenterPoint({
      viewer: this.viewer,
      position: this.centerPosition,
    });
  }

  #addCircleToViewer() {
    this.circle = createCircle({
      viewer: this.viewer,
      position: this.centerPosition,
    });
  }

  #addLabelToViewer() {
    this.label = createLabel({
      viewer: this.viewer,
      position: this.centerPosition,
    });
  }

  #registerRadiusCallBack() {
    /* 
    CallbackPropery로 실시간 동적 업데이트
    최소값 설정(각 axis값 0이 될 시 에러 발생) 
    */
    this.circle.ellipse.semiMajorAxis = new Cesium.CallbackProperty(() => {
      return Math.max(this.radius, 0.01);
    }, false);

    this.circle.ellipse.semiMinorAxis = new Cesium.CallbackProperty(() => {
      return Math.max(this.radius, 0.01);
    }, false);
  }

  #registerLabelCallBack() {
    this.label.label.text = new Cesium.CallbackProperty(() => {
      return formatByMeter(this.radius, 2);
    }, false);
  }
}

class CircleStack extends ShapeLayer {
  constructor(viewer) {
    super(viewer);
  }

  updateData(circleGroup) {
    if (!this._readData) return;
    const data = {
      id: circleGroup.id,
      name: circleGroup.name,
      value: circleGroup.radius,
    };
    this.dataStack.push(data);
    this._readData([...this.dataStack]);
  }

  toggleShowCircleGroup(circleGroupArr, id, showState) {
    circleGroupArr.forEach((circleGroup) => {
      if (circleGroup.id !== id) return;
      circleGroup.toggleShow(showState);
    });
  }

  zoomToCircleGroup(circleGroupArr, id) {
    circleGroupArr.forEach((circleGroup) => {
      if (circleGroup.id !== id) return;
      const offset = new Cesium.HeadingPitchRange(...ShapeLayer.OFFSET);
      this.viewer.zoomTo(circleGroup.circle, offset);
      this.#highlightLabel(circleGroup);
    });
  }

  deleteCircleGroup(circleGroupArr, id) {
    return circleGroupArr.filter((circleGroup) => {
      if (circleGroup.id !== id) return true;
      else {
        this.#deleteCircleGroupEntities(circleGroup);
        return false;
      }
    });
  }

  #highlightLabel(circleGroup) {
    circleGroup.label.label.backgroundColor = new Cesium.Color(
      ...ShapeLayer.HIGHLIGHT,
    );

    setTimeout(() => {
      circleGroup.label.label.backgroundColor = new Cesium.Color(
        ...ShapeLayer.BG_DEFAULT,
      );
    }, ShapeLayer.DURATION);
  }

  #deleteCircleGroupEntities(circleGroup) {
    this.viewer.entities.remove(circleGroup.centerPoint);
    this.viewer.entities.remove(circleGroup.circle);
    this.viewer.entities.remove(circleGroup.label);
  }
}

export default class CircleController extends ShapeController {
  static nextId = 1;

  constructor(viewer) {
    super(viewer);
    this.isDrawing = false;
    this.circleGroup = new CircleGroup(viewer);
    this.circleGroupArr = [];
    this.circleStack = new CircleStack(viewer);
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
  }

  stopDrawing() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  forceReset() {
    this.#clearCircleGroupArr();
    this.#resetCircleGroup();
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;

    if (!this.isDrawing) this.#firstClickHandler(clickPosition);
    else this.#secondClickHandler();
  }

  onMouseMove(movement) {
    if (!this.isDrawing) return;

    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });
    if (!Cesium.defined(newPosition)) return;

    this.circleGroup.radius = calculateRadius(
      this.circleGroup.centerPosition,
      newPosition,
    );
  }

  toggleShowGroup(id, showState) {
    this.circleStack.toggleShowCircleGroup(this.circleGroupArr, id, showState);
  }

  zoomToGroup(id) {
    this.circleStack.zoomToCircleGroup(this.circleGroupArr, id);
  }

  deleteGroup(id) {
    this.circleGroupArr = this.circleStack.deleteCircleGroup(
      this.circleGroupArr,
      id,
    );
  }

  #deleteCircleGroupEntities(circleGroup) {
    this.viewer.entities.remove(circleGroup.centerPoint);
    this.viewer.entities.remove(circleGroup.circle);
    this.viewer.entities.remove(circleGroup.label);
  }

  #clearCircleGroupArr() {
    this.circleGroupArr.forEach((circleGroup) => {
      this.#deleteCircleGroupEntities(circleGroup);
    });

    this.circleGroupArr = [];
    this.circleStack.dataStack = [];
  }

  #resetCircleGroup() {
    this.isDrawing = false;
    this.#deleteCircleGroupEntities(this.circleGroup);
    this.circleGroup = new CircleGroup(this.viewer);
  }

  #firstClickHandler(clickPosition) {
    this.isDrawing = true;

    this.circleGroup.centerPosition = clickPosition;
    this.circleGroup.addCircleGroupToViewer(clickPosition);
    this.circleGroup.registerCircleGroupCallback();
  }

  #secondClickHandler() {
    this.isDrawing = false;

    this.circleGroup.id = CircleController.nextId;
    this.circleGroup.name = `Radius ${CircleController.nextId++}`;
    this.circleGroupArr.push(this.circleGroup);
    this.circleStack.updateData(this.circleGroup);
    this.circleGroup = new CircleGroup(this.viewer);
  }
}
