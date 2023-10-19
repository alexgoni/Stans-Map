import * as Cesium from "cesium";

export default class CircleGroup {
  constructor(viewer, centerPosition) {
    this.viewer = viewer;
    this.centerPosition = centerPosition;

    // Create center point entity
    this.centerEntity = viewer.entities.add({
      position: centerPosition,
      point: {
        pixelSize: 6,
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.RED,
        outlineWidth: 1,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    // Create circle entity
    this.circleEntity = viewer.entities.add({
      position: centerPosition,
      ellipse: {
        semiMinorAxis: 0.01,
        semiMajorAxis: 0.01,
        material: Cesium.Color.RED.withAlpha(0.3),
      },
    });

    // Create label entity
    this.labelEntity = viewer.entities.add({
      position: centerPosition,
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

  updateRadius(surfaceDistance) {
    /* 
    CallbackPropery로 실시간 동적 업데이트
    최소값 설정(각 axis값 0이 될 시 에러 발생) 
    */
    this.circleEntity.ellipse.semiMajorAxis = new Cesium.CallbackProperty(
      () => {
        return Math.max(surfaceDistance, 0.01);
      },
      false,
    );

    this.circleEntity.ellipse.semiMinorAxis = new Cesium.CallbackProperty(
      () => {
        return Math.max(surfaceDistance, 0.01);
      },
      false,
    );
  }

  updateLabel(text) {
    this.labelEntity.label.text = text;
  }

  destroy() {
    this.viewer.entities.remove(this.centerEntity);
    this.viewer.entities.remove(this.circleEntity);
    this.viewer.entities.remove(this.labelEntity);
  }
}
