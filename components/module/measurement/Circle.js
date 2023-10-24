import {
  calculateRadius,
  getRayPosition,
} from "@/components/handler/cesium/measurement/GeoInfo";
import * as Cesium from "cesium";

class CircleGroup {
  constructor(viewer) {
    this.viewer = viewer;
    this.centerPosition = null;
    this.centerPoint = null;
    this.circle = null;
    this.label = null;
  }

  addCenterToViewer() {
    // TODO: Entity 함수에 등록
    this.centerPoint = this.viewer.entities.add({
      position: this.centerPosition,
      point: {
        pixelSize: 6,
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.RED,
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  }

  addCircleToViewer() {
    this.circle = this.viewer.entities.add({
      position: this.centerPosition,
      ellipse: {
        semiMinorAxis: 0.01,
        semiMajorAxis: 0.01,
        material: Cesium.Color.RED.withAlpha(0.3),
      },
    });
  }

  addLabelToViewer() {
    this.label = this.viewer.entities.add({
      position: this.centerPosition,
      label: {
        text: "0.00m", // Default text, can be updated later
        font: "14px sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        scale: 1,
        showBackground: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  }

  addCircleGroupToViewer() {
    this.addCenterToViewer();
    this.addCircleToViewer();
    this.addLabelToViewer();
  }

  updateRadius(newRadius) {
    /* 
    CallbackPropery로 실시간 동적 업데이트
    최소값 설정(각 axis값 0이 될 시 에러 발생) 
    */
    this.circle.ellipse.semiMajorAxis = new Cesium.CallbackProperty(() => {
      return Math.max(newRadius, 0.01);
    }, false);

    this.circle.ellipse.semiMinorAxis = new Cesium.CallbackProperty(() => {
      return Math.max(newRadius, 0.01);
    }, false);
  }

  updateLabel(newRadius) {
    this.label.label.text = new Cesium.CallbackProperty(() => {
      if (newRadius >= 1000) {
        return `${(newRadius / 1000).toFixed(2)}km`;
      } else {
        return `${newRadius.toFixed(2)}m`;
      }
    }, false);
  }

  updateCircleGroup(newRadius) {
    this.updateRadius(newRadius);
    this.updateLabel(newRadius);
  }
}

export default class CircleDrawer {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.initClick = false;
    this.circleGroup = null;
    this.circleGroupArr = [];

    this.onLeftClick = this.onLeftClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
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
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;
    if (!this.initClick) {
      this.initClick = true;

      this.circleGroup = new CircleGroup(this.viewer);
      this.circleGroup.centerPosition = clickPosition;
      this.circleGroup.addCircleGroupToViewer(clickPosition);
    } else {
      this.initClick = false;
      this.circleGroupArr.push(this.circleGroup);
    }
  }

  onMouseMove(movement) {
    if (!this.initClick) return;
    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });
    if (Cesium.defined(newPosition)) {
      const surfaceDistance = calculateRadius(
        this.circleGroup.centerPosition,
        newPosition,
      );
      this.circleGroup.updateCircleGroup(surfaceDistance);
    }
  }
}
