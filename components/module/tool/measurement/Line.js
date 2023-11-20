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
import { ShapeGroup, ShapeDrawer } from "./Shape";

class LineGroup extends ShapeGroup {
  constructor(viewer) {
    super(viewer);
    this.polylineArr = [];
    this.distance = this.value;
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

  removeLastPointPosition() {
    this.pointPositionArr.pop();
    this.label.position = this.pointEntityArr.slice(-1)[0].position;
  }

  addPolylineToViewer() {
    const positions = Cesium.Cartesian3.fromDegreesArray(
      this.pointPositionArr.flat(),
    );
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
      }
      return `${(this.distance * 1000).toFixed(2)}m`;
    }, false);
  }

  calculateDistanceAndUpdateLabel() {
    this.distance = calculateDistance(this.pointPositionArr);
    this.updateLabel();
  }
}

export default class LineDrawer extends ShapeDrawer {
  constructor(viewer) {
    super(viewer);
    this.floatingPointCoordinate = null;
    this.dashLine = null;

    this.lineGroup = new LineGroup(this.viewer);
    this.lineGroupArr = [];
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

    const lineGroupFirstClickHandler = () => {
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
    };

    if (this.lineGroup.pointEntityNum === 0) {
      lineGroupFirstClickHandler();
    }

    this.lineGroup.addPointToViewer(clickPosition);
    this.lineGroup.addPolylineToViewer();
  }

  onMouseMove(movement) {
    if (!Cesium.defined(this.floatingPoint)) return;

    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });
    if (!Cesium.defined(newPosition)) return;

    const updateFloatingPoint = () => {
      this.floatingPoint.position.setValue(newPosition);
      this.floatingPointCoordinate = getCoordinate(newPosition);
    };

    const updatePointPositionArr = () => {
      this.lineGroup.pointPositionArr.pop();
      this.lineGroup.pointPositionArr.push(this.floatingPointCoordinate);
    };

    updateFloatingPoint();
    updatePointPositionArr();
    this.lineGroup.calculateDistanceAndUpdateLabel();
  }

  onRightClick() {
    if (!Cesium.defined(this.floatingPoint)) return;

    // movement event에서 마지막으로 push된 element 제거
    this.lineGroup.removeLastPointPosition();

    const removeOneClickEntities = () => {
      this.viewer.entities.remove(this.lineGroup.pointEntityArr[0]);
      this.viewer.entities.remove(this.lineGroup.label);
    };

    const lineGroupEndEvent = () => {
      this.lineGroup.calculateDistanceAndUpdateLabel();
      this.lineGroupArr.push(this.lineGroup);
    };

    if (this.lineGroup.pointEntityNum === 1) removeOneClickEntities();
    else lineGroupEndEvent();

    this.resetLineGroup();
  }
}