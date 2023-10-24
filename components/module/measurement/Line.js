import * as Cesium from "cesium";
import {
  createDashline,
  createLinePoint,
  createPolyline,
} from "@/components/handler/cesium/Entity";
import {
  calculateDistance,
  getCoordinate,
  getRayPosition,
} from "@/components/handler/cesium/measurement/GeoInfo";
import * as turf from "@turf/turf";

// TODO: label entity, drag
class LineGroup {
  constructor(viewer) {
    this.viewer = viewer;
    this.pointArr = [];
    this.pointCoordinateArr = [];
    this.polylineArr = [];
    this.distance = 0;
    this.label = null;
  }

  addPoint(point) {
    this.pointArr.push(point);
  }

  addPolyline(polyline) {
    this.polylineArr.push(polyline);
  }

  addPointCoordinates(coordinates) {
    this.pointCoordinateArr.push(coordinates);
  }

  createDistanceLabel(position) {
    this.label = this.viewer.entities.add({
      position,
      label: {
        text: this.distance.toFixed(2) + "m",
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

  // updateDistanceLabel(newPosition) {
  //   this.label.position.setValue(newPosition);

  //   // this.label.label.text = new Cesium.CallbackProperty(() => {
  //   //   return this.distance.toFixed(2).km;
  //   // }, false);
  // }
}

export default class LineDrawer {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.floatingPoint = null;
    this.movingCoordinate = null;
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

  clearLineGroupArr() {
    this.lineGroupArr.forEach((lineGroup) => {
      lineGroup.pointArr.forEach((entity) =>
        this.viewer.entities.remove(entity),
      );
      lineGroup.polylineArr.forEach((entity) =>
        this.viewer.entities.remove(entity),
      );
    });

    this.lineGroupArr = [];
  }

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (!Cesium.defined(clickPosition)) return;

    if (this.lineGroup.pointArr.length === 0) {
      this.floatingPoint = createLinePoint({
        viewer: this.viewer,
        position: clickPosition,
        geoInfo: getCoordinate(clickPosition),
      });
    }

    const point = createLinePoint({
      viewer: this.viewer,
      position: clickPosition,
      geoInfo: getCoordinate(clickPosition),
    });

    this.lineGroup.addPoint(point);
    this.lineGroup.addPointCoordinates([point.longitude, point.latitude]);

    // first click 이후 dash line 추가
    if (this.lineGroup.pointArr.length === 1) {
      const dynamicPolylinePosition = new Cesium.CallbackProperty(() => {
        const prevCoordinate = this.lineGroup.pointCoordinateArr.slice(-1)[0];
        const prevLongitude = prevCoordinate?.[0];
        const prevLatitude = prevCoordinate?.[1];

        if (!(prevLongitude && prevLatitude && this.movingCoordinate)) return;

        return [
          Cesium.Cartesian3.fromDegrees(prevLongitude, prevLatitude),
          Cesium.Cartesian3.fromDegrees(
            this.movingCoordinate[0],
            this.movingCoordinate[1],
          ),
        ];
      }, false);

      this.lineGroup.createDistanceLabel(this.floatingPoint.position);

      this.lineGroup.distance = new Cesium.CallbackProperty(() => {
        if (this.movingCoordinate) {
          const candidateCoordinateArr = [
            ...this.lineGroup.pointCoordinateArr,
            this.movingCoordinate,
          ];
          return calculateDistance(candidateCoordinateArr);
        }
      }, false);
      this.dashLine = createDashline({
        viewer: this.viewer,
        positions: dynamicPolylinePosition,
      });
    }

    const polylinePosition = Cesium.Cartesian3.fromDegreesArray(
      this.lineGroup.pointCoordinateArr.flat(),
    );

    const polyline = createPolyline({
      viewer: this.viewer,
      positions: polylinePosition,
    });

    this.lineGroup.addPolyline(polyline);
  }

  onMouseMove(movement) {
    // floatingPoint 존재 => 선이 그려지는 중(move event, right click event 허용)
    if (!Cesium.defined(this.floatingPoint)) return;

    const newPosition = getRayPosition({
      viewer: this.viewer,
      position: movement.endPosition,
    });

    if (Cesium.defined(newPosition)) {
      const [longitude, latitude] = getCoordinate(newPosition);
      this.floatingPoint.position.setValue(newPosition);
      this.movingCoordinate = [longitude, latitude];
    }

    // TODO: 나중에 고치자 ~ 심화과정
    const checkSize = this.lineGroup.pointCoordinateArr.length;
    if (checkSize <= 2) return;
    const line = turf.lineString(this.lineGroup.pointCoordinateArr);
    const distance = turf.lineDistance(line, { units: "kilometers" });
    this.lineGroup.label.label.text = distance.toFixed(2) + "km";
  }

  onRightClick() {
    // floatingPoint 존재 => 선이 그려지는 중(move event, right click event 허용)
    if (!Cesium.defined(this.floatingPoint)) return;
    if (this.lineGroup.pointArr.length === 1) {
      this.viewer.entities.remove(this.lineGroup.pointArr[0]);
    } else {
      this.lineGroup.distance = calculateDistance(
        this.lineGroup.pointCoordinateArr,
      );
      this.lineGroup.label.position =
        this.lineGroup.pointArr.slice(-1)[0].position;
      this.lineGroup.label.label.text =
        this.lineGroup.distance.toFixed(2) + "km";

      this.lineGroupArr.push(this.lineGroup);
      this.lineGroup = new LineGroup(this.viewer);
    }

    this.viewer.entities.remove(this.floatingPoint);
    this.viewer.entities.remove(this.dashLine);

    this.floatingPoint = null;
    this.movingCoordinate = null;
  }
}
