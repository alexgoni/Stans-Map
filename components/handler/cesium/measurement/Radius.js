import * as Cesium from "cesium";

/**
 *
 * @description 'circleGroupArr' should be declared externally.
 */
function circleDrawingHandler({
  viewer,
  handler,
  circleGroupArr,
  radiusWidgetOpen,
}) {
  // Click Flag
  let initClick = true;

  // Entities
  let circle = null;
  let label = null;
  let circleGroup = {};

  if (radiusWidgetOpen) {
    handler.setInputAction((click) => {
      const ray = viewer.camera.getPickRay(click.position);
      const clickPosition = viewer.scene.globe.pick(ray, viewer.scene);
      if (Cesium.defined(clickPosition)) {
        const cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);

        if (initClick) {
          const center = viewer.entities.add({
            position: clickPosition,
            point: {
              pixelSize: 6,
              color: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.RED,
              outlineWidth: 1,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            longitude: longitude,
            latitude: latitude,
          });
          circleGroup.center = center;
          initClick = false;

          circle = viewer.entities.add({
            position: clickPosition,
            ellipse: {
              semiMinorAxis: 0.01,
              semiMajorAxis: 0.01,
              material: Cesium.Color.RED.withAlpha(0.3),
            },
          });

          let surfaceDistance = 0;

          label = viewer.entities.add({
            position: clickPosition,
            label: {
              text: new Cesium.CallbackProperty(() => {
                if (surfaceDistance >= 1000) {
                  return `${(surfaceDistance / 1000).toFixed(2)}km`;
                } else {
                  return `${surfaceDistance.toFixed(2)}m`;
                }
              }, false),
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

          handler.setInputAction((movement) => {
            const ray = viewer.camera.getPickRay(movement.endPosition);
            const movePosition = viewer.scene.globe.pick(ray, viewer.scene);
            if (Cesium.defined(movePosition)) {
              const startCartographic =
                Cesium.Cartographic.fromCartesian(clickPosition);

              const endCartographic =
                Cesium.Cartographic.fromCartesian(movePosition);

              const ellipsoid = Cesium.Ellipsoid.WGS84;
              const geodesic = new Cesium.EllipsoidGeodesic(
                startCartographic,
                endCartographic,
                ellipsoid,
              );
              // 최대 반지름 3600km
              surfaceDistance = Math.min(geodesic.surfaceDistance, 3600000);

              /* 
              CallbackPropery로 실시간 동적 업데이트
              최소값 설정(각 axis값 0이 될 시 에러 발생) 
              */
              circle.ellipse.semiMajorAxis = new Cesium.CallbackProperty(() => {
                return Math.max(surfaceDistance, 0.01);
              }, false);

              circle.ellipse.semiMinorAxis = new Cesium.CallbackProperty(() => {
                return Math.max(surfaceDistance, 0.01);
              }, false);
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        } else {
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);

          circleGroup.circle = circle;
          circleGroup.label = label;

          // Click Flag 초기화
          initClick = true;

          circleGroupArr.push({ ...circleGroup });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  } else {
    circleGroupArr.forEach((element) => {
      viewer.entities.remove(element.center);
      viewer.entities.remove(element.circle);
      viewer.entities.remove(element.label);
    });

    // 빈 배열로 초기화
    circleGroupArr.length = 0;
  }
}

export { circleDrawingHandler };
