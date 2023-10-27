import * as Cesium from "cesium";
import {
  createDashline,
  createLabel,
  createLinePoint,
  createPolyline,
} from "@/components/handler/cesium/Entity";
import {
  calculateDistance,
  getCoordinate,
  getRayPosition,
} from "@/components/handler/cesium/GeoInfo";

class LineGroup {
  constructor(viewer) {
    this.viewer = viewer;
    this.pointEntityArr = [];
    this.pointPositionArr = [];
    this.polylineArr = [];
    this.distance = 0;
    this.label = null;
  }

  addPointToViewer(position) {
    const point = createLinePoint({
      viewer: this.viewer,
      position,
    });

    this.pointEntityArr.push(point);
    this.addPointPosition(position);
  }

  addPointPosition(position) {
    this.pointPositionArr.push(getCoordinate(position));
  }

  isPointCount(number) {
    return this.pointEntityArr.length === number;
  }

  removeLastPointPosition() {
    this.pointPositionArr.pop();
    this.label.position = this.pointEntityArr.slice(-1)[0].position;
  }

  addPolylineToViewer(positions) {
    const polyline = createPolyline({
      viewer: this.viewer,
      positions,
    });

    this.polylineArr.push(polyline);
  }

  addLabelToViewer(position) {
    this.label = createLabel({ viewer: this.viewer, position });
  }

  updateLabel() {
    this.label.label.text = new Cesium.CallbackProperty(() => {
      if (this.distance > 1) {
        return `${this.distance.toFixed(2)}km`;
      } else {
        return `${(this.distance * 1000).toFixed(2)}m`;
      }
    }, false);
  }

  calculateDistanceAndUpdateLabel() {
    this.distance = calculateDistance(this.pointPositionArr);
    this.updateLabel();
  }
}

export default class LineDrawer {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.floatingPoint = null;
    this.floatingPointCoordinate = null;
    this.dashLine = null;

    this.lineGroup = new LineGroup(this.viewer);
    this.lineGroupArr = [];

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

  resetLineGroup() {
    this.viewer.entities.remove(this.floatingPoint);
    this.viewer.entities.remove(this.dashLine);

    this.floatingPoint = null;
    this.floatingPointCoordinate = null;
    this.dashLine = null;

    this.lineGroup = new LineGroup(this.viewer);
  }

  clearLineGroupArr() {
    this.lineGroupArr.forEach((lineGroup) => {
      lineGroup.pointEntityArr.forEach((entity) =>
        this.viewer.entities.remove(entity),
      );
      lineGroup.polylineArr.forEach((entity) =>
        this.viewer.entities.remove(entity),
      );
      this.viewer.entities.remove(lineGroup.label);
    });

    this.lineGroupArr = [];
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;

    if (this.lineGroup.isPointCount(0)) {
      this.floatingPoint = createLinePoint({
        viewer: this.viewer,
        position: clickPosition,
      });
      this.lineGroup.addPointPosition(clickPosition);
      this.lineGroup.addLabelToViewer(this.floatingPoint.position);

      const dynamicPolylinePosition = new Cesium.CallbackProperty(() => {
        // last fixed point position
        const prevCoordinate =
          this.lineGroup.pointPositionArr[
            this.lineGroup.pointEntityArr.length - 1
          ];
        if (!prevCoordinate) return;

        const prevLongitude = prevCoordinate[0];
        const prevLatitude = prevCoordinate[1];

        // first click 이후 움직이지 않을 때 return null
        if (!this.floatingPointCoordinate) return;

        return [
          Cesium.Cartesian3.fromDegrees(prevLongitude, prevLatitude),
          Cesium.Cartesian3.fromDegrees(
            this.floatingPointCoordinate[0],
            this.floatingPointCoordinate[1],
          ),
        ];
      }, false);

      this.dashLine = createDashline({
        viewer: this.viewer,
        positions: dynamicPolylinePosition,
      });
    }

    this.lineGroup.addPointToViewer(clickPosition);

    const polylinePosition = Cesium.Cartesian3.fromDegreesArray(
      this.lineGroup.pointPositionArr.flat(),
    );
    this.lineGroup.addPolylineToViewer(polylinePosition);
  }

  onMouseMove(movement) {
    if (!Cesium.defined(this.floatingPoint)) return;

    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });

    if (Cesium.defined(newPosition)) {
      this.floatingPoint.position.setValue(newPosition);
      this.floatingPointCoordinate = getCoordinate(newPosition);

      this.lineGroup.pointPositionArr.pop();
      this.lineGroup.pointPositionArr.push(this.floatingPointCoordinate);

      this.lineGroup.calculateDistanceAndUpdateLabel();
    }
  }

  onRightClick() {
    if (!Cesium.defined(this.floatingPoint)) return;

    // movement event에서 마지막으로 push된 element 제거
    this.lineGroup.removeLastPointPosition();

    if (this.lineGroup.isPointCount(1)) {
      this.viewer.entities.remove(this.lineGroup.pointEntityArr[0]);
      this.viewer.entities.remove(this.lineGroup.label);
    } else {
      this.lineGroup.calculateDistanceAndUpdateLabel();
      this.lineGroupArr.push(this.lineGroup);
    }

    this.resetLineGroup();
  }
}
