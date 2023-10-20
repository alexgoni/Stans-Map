import * as Cesium from "cesium";
import { createMeasurePoint } from "@/components/handler/cesium/Entity";
import {
  getCoordinate,
  getRayPosition,
} from "@/components/handler/cesium/measurement/GeoInfo";
import * as turf from "@turf/turf";

class LineGroup {
  constructor() {
    this.pointArr = [];
    this.pointCoordinateArr = [];
    this.polylineArr = [];
    this.distance = 0;
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

  clear() {
    this.pointArr = [];
    this.pointCoordinateArr = [];
    this.lineGroupArr = [];
    this.lineGroup.forEach((element) => {
      this.viewer.entities.remove(element);
    });
    this.lineGroup = [];
  }
}

export default class LineDrawer {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.floatingPoint = null;
    this.movingCoordinate = null;
    this.dashLine = null;
    this.lineGroup = new LineGroup();
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

    if (Cesium.defined(clickPosition)) {
      if (this.lineGroup.pointArr.length === 0) {
        this.floatingPoint = createMeasurePoint({
          viewer: this.viewer,
          position: clickPosition,
          geoInfo: getCoordinate(clickPosition),
        });
      }

      const point = createMeasurePoint({
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

          if (prevLongitude && prevLatitude && this.movingCoordinate) {
            return [
              Cesium.Cartesian3.fromDegrees(prevLongitude, prevLatitude),
              Cesium.Cartesian3.fromDegrees(
                this.movingCoordinate.longitude,
                this.movingCoordinate.latitude,
              ),
            ];
          }

          return null;
        }, false);

        this.dashLine = this.viewer.entities.add({
          polyline: {
            positions: dynamicPolylinePosition,
            width: 2,
            clampToGround: true,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.YELLOW,
              dashLength: 16.0,
              dashPattern: 255,
            }),
          },
        });
      }
      const polyline = this.viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(
            this.lineGroup.pointCoordinateArr.flat(),
          ),
          width: 5,
          clampToGround: true,
          material: Cesium.Color.GOLD,
        },
      });

      this.lineGroup.addPolyline(polyline);
    }
  }

  onMouseMove(movement) {
    // floatingPoint 존재 => 선이 그려지는 중(move event, right click event 허용)
    if (Cesium.defined(this.floatingPoint)) {
      const newPosition = getRayPosition({
        viewer: this.viewer,
        position: movement.endPosition,
      });

      if (Cesium.defined(newPosition)) {
        const [longitude, latitude] = getCoordinate(newPosition);
        this.floatingPoint.position.setValue(newPosition);
        this.movingCoordinate = { longitude, latitude };
      }
    }
  }

  onRightClick() {
    // floatingPoint 존재 => 선이 그려지는 중(move event, right click event 허용)
    if (Cesium.defined(this.floatingPoint)) {
      if (this.lineGroup.pointArr.length === 1) {
        this.viewer.entities.remove(this.lineGroup.pointArr[0]);
      } else {
        const line = turf.lineString(this.lineGroup.pointCoordinateArr);
        const distance = turf.lineDistance(line, { units: "kilometers" });
        this.lineGroup.distance = distance;

        this.lineGroupArr.push(this.lineGroup);
        this.lineGroup = new LineGroup();
      }

      this.viewer.entities.remove(this.floatingPoint);
      this.viewer.entities.remove(this.lineGroup.dashLine);

      this.floatingPoint = null;
      this.movingCoordinate = null;
    }
  }
}
