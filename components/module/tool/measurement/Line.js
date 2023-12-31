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
import { ShapeGroup, ShapeController, ShapeLayer } from "./Shape";
import { formatByKilo } from "../../lib/formatter";

export default class LineController extends ShapeController {
  static nextId = 1;

  constructor(viewer) {
    super(viewer);
    this.floatingPointCoordinate = null;
    this.dashLine = null;
    this.lineGroup = new LineGroup(viewer);
    this.lineGroupArr = [];
    this.lineStack = new LineStack(viewer);
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;

    if (this.lineGroup.pointEntityNum === 0) {
      this.#lineGroupFirstClickHandler(clickPosition);
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

    this.#updateFloatingPoint(newPosition);
    this.#updatePointPositionArr();
    this.lineGroup.calculateDistanceAndUpdateLabel();
  }

  onRightClick() {
    if (!Cesium.defined(this.floatingPoint)) return;

    // movement event에서 마지막으로 push된 element 제거
    this.lineGroup.removeLastPointPosition();
    if (this.lineGroup.pointEntityNum === 1) this.#removeOneClickEntities();
    else this.#lineGroupEndEvent();

    this.#resetLineGroup();
  }

  toggleShowGroup(id, showState) {
    this.lineStack.toggleShowLineGroup(this.lineGroupArr, id, showState);
  }

  zoomToGroup(id) {
    this.lineStack.zoomToLineGroup(this.lineGroupArr, id);
  }

  deleteGroup(id) {
    this.lineGroupArr = this.lineStack.deleteLineGroup(this.lineGroupArr, id);
  }

  #lineGroupFirstClickHandler(clickPosition) {
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

  #updateFloatingPoint(newPosition) {
    this.floatingPoint.position.setValue(newPosition);
    this.floatingPointCoordinate = getCoordinate(newPosition);
  }

  #updatePointPositionArr() {
    this.lineGroup.pointPositionArr.pop();
    this.lineGroup.pointPositionArr.push(this.floatingPointCoordinate);
  }

  #removeOneClickEntities() {
    this.viewer.entities.remove(this.lineGroup.pointEntityArr[0]);
    this.viewer.entities.remove(this.lineGroup.label);
  }

  #lineGroupEndEvent() {
    this.lineGroup.calculateDistanceAndUpdateLabel();
    this.lineGroup.id = LineController.nextId;
    this.lineGroup.name = `Distance ${LineController.nextId++}`;
    this.lineGroupArr.push(this.lineGroup);
    this.lineStack.updateData(this.lineGroup);
  }

  #resetLineGroup() {
    this.viewer.entities.remove(this.floatingPoint);
    this.viewer.entities.remove(this.dashLine);

    this.floatingPoint = null;
    this.floatingPointCoordinate = null;
    this.dashLine = null;

    this.lineGroup = new LineGroup(this.viewer);
  }
}

class LineGroup extends ShapeGroup {
  constructor(viewer) {
    super(viewer);
    this.name = null;
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

  calculateDistanceAndUpdateLabel() {
    this.distance = calculateDistance(this.pointPositionArr);
    this.#updateLabel();
  }

  toggleShow(showState) {
    this.pointEntityArr.forEach((entity) => {
      entity.show = showState;
    });
    this.polylineArr.forEach((entity) => {
      entity.show = showState;
    });
    this.label.show = showState;
  }

  #updateLabel() {
    this.label.label.text = new Cesium.CallbackProperty(() => {
      return formatByKilo(this.distance, 2);
    }, false);
  }
}

class LineStack extends ShapeLayer {
  constructor(viewer) {
    super(viewer);
  }

  updateData(lineGroup) {
    if (!this._readData) return;
    const data = {
      id: lineGroup.id,
      name: lineGroup.name,
      value: lineGroup.distance,
    };
    this.dataStack.push(data);
    this._readData([...this.dataStack]);
  }

  toggleShowLineGroup(lineGroupArr, id, showState) {
    lineGroupArr.forEach((lineGroup) => {
      if (lineGroup.id !== id) return;
      lineGroup.toggleShow(showState);
    });
  }

  zoomToLineGroup(lineGroupArr, id) {
    lineGroupArr.forEach((lineGroup) => {
      if (lineGroup.id !== id) return;
      const offset = new Cesium.HeadingPitchRange(...ShapeLayer.OFFSET);
      this.viewer.zoomTo(lineGroup.label, offset);
      this.#highlightLabel(lineGroup);
    });
  }

  deleteLineGroup(lineGroupArr, id) {
    return lineGroupArr.filter((lineGroup) => {
      if (lineGroup.id !== id) return true;
      else {
        this.#deleteLineGroupEntities(lineGroup);
        return false;
      }
    });
  }

  #highlightLabel(lineGroup) {
    lineGroup.label.label.backgroundColor = new Cesium.Color(
      ...ShapeLayer.HIGHLIGHT,
    );

    setTimeout(() => {
      lineGroup.label.label.backgroundColor = new Cesium.Color(
        ...ShapeLayer.BG_DEFAULT,
      );
    }, ShapeLayer.DURATION);
  }

  #deleteLineGroupEntities(lineGroup) {
    lineGroup.pointEntityArr.forEach((entity) =>
      this.viewer.entities.remove(entity),
    );
    lineGroup.polylineArr.forEach((entity) =>
      this.viewer.entities.remove(entity),
    );
    this.viewer.entities.remove(lineGroup.label);
  }
}
