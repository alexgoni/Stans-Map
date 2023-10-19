import * as Cesium from "cesium";
import { createMeasurePoint } from "@/components/handler/cesium/Entity";
import {
  getCoordinate,
  getRayPosition,
} from "@/components/handler/cesium/measurement/GeoInfo";
import * as turf from "@turf/turf";

export default class LineDrawer {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.floatingPoint = null;
    this.movingCoordinate = null;
    this.dashLine = null;
    // entity array
    this.pointArr = [];
    // geoInfo array => polyline
    this.pointCoordinateArr = [];

    /* 
    프로퍼티에 메서드 할당

    이벤트 핸들러가 호출될 때 this가 
    올바른 인스턴스를 참조할 수 있도록 한다. 
    */
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

  onLeftClick(click) {
    const clickPosition = getRayPosition({
      viewer: this.viewer,
      position: click.position,
    });
    if (Cesium.defined(clickPosition)) {
      // first click
      if (this.pointArr.length === 0) {
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

      this.pointArr.push(point);

      if (this.pointArr.length === 1) {
        const dynamicPolylinePosition = new Cesium.CallbackProperty(() => {
          const prevLongitude =
            this.pointArr[this.pointArr.length - 1].longitude;
          const prevLatitude = this.pointArr[this.pointArr.length - 1].latitude;

          if (this.movingCoordinate !== null) {
            return [
              Cesium.Cartesian3.fromDegrees(prevLongitude, prevLatitude),
              Cesium.Cartesian3.fromDegrees(
                this.movingCoordinate.longitude,
                this.movingCoordinate.latitude,
              ),
            ];
          }
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

      this.pointCoordinateArr.push([point.longitude, point.latitude]);

      const polyline = this.viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(
            this.pointCoordinateArr.flat(),
          ),
          width: 5,
          clampToGround: true,
          material: Cesium.Color.GOLD,
        },
      });
    }
  }

  onMouseMove(movement) {
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
    if (this.pointArr.length === 1) {
      this.viewer.entities.remove(this.pointArr[0]);
    }

    const line = turf.lineString(this.pointCoordinateArr);
    const distance = turf.lineDistance(line, { units: "kilometers" });
    console.log("Distance along the line:", distance, "kilometers");

    this.viewer.entities.remove(this.floatingPoint);
    this.viewer.entities.remove(this.dashLine);

    this.floatingPoint = null;
    this.dashLine = null;
    this.movingCoordinate = null;
    this.pointArr = [];
    this.pointCoordinateArr = [];
  }
}
