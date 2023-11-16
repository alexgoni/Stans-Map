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
import { ShapeGroup, ShapeDrawer } from "./Shape";

class CircleGroup extends ShapeGroup {
  constructor(viewer) {
    super(viewer);
    this.centerPosition = null;
    this.centerPoint = null;
    this.circle = null;
    this.radius = this.value;
  }

  addPointerToViewer() {
    this.centerPoint = createCenterPoint({
      viewer: this.viewer,
      position: this.centerPosition,
    });
  }

  addCircleToViewer() {
    this.circle = createCircle({
      viewer: this.viewer,
      position: this.centerPosition,
    });
  }

  addLabelToViewer() {
    this.label = createLabel({
      viewer: this.viewer,
      position: this.centerPosition,
    });
  }

  addCircleGroupToViewer() {
    this.addPointerToViewer();
    this.addCircleToViewer();
    this.addLabelToViewer();
  }

  registerRadiusCallBack() {
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

  registerLabelCallBack() {
    this.label.label.text = new Cesium.CallbackProperty(() => {
      if (this.radius >= 1000) {
        return `${(this.radius / 1000).toFixed(2)}km`;
      } else {
        return `${this.radius.toFixed(2)}m`;
      }
    }, false);
  }

  registerCircleGroupCallback() {
    this.registerRadiusCallBack(this.radius);
    this.registerLabelCallBack(this.radius);
  }
}

export default class CircleDrawer extends ShapeDrawer {
  constructor(viewer) {
    super(viewer);
    this.isDrawing = false;
    this.circleGroup = new CircleGroup(this.viewer);
    this.circleGroupArr = [];
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

  clearCircleGroupArr() {
    this.circleGroupArr.forEach((circleGroup) => {
      this.viewer.entities.remove(circleGroup.centerPoint);
      this.viewer.entities.remove(circleGroup.circle);
      this.viewer.entities.remove(circleGroup.label);
    });

    this.circleGroupArr = [];
  }

  forceReset() {
    this.clearCircleGroupArr();
    this.isDrawing = false;
    this.viewer.entities.remove(this.circleGroup.centerPoint);
    this.viewer.entities.remove(this.circleGroup.circle);
    this.viewer.entities.remove(this.circleGroup.label);
    this.circleGroup = new CircleGroup(this.viewer);
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;

    const firstClickHandler = () => {
      this.isDrawing = true;

      this.circleGroup.centerPosition = clickPosition;
      this.circleGroup.addCircleGroupToViewer(clickPosition);
      this.circleGroup.registerCircleGroupCallback();
    };

    const secondClickHandler = () => {
      this.isDrawing = false;

      this.circleGroupArr.push(this.circleGroup);
      this.circleGroup = new CircleGroup(this.viewer);
    };

    if (!this.isDrawing) firstClickHandler();
    else secondClickHandler();
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
}
