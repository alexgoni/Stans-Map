import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { defaultCamera } from "@/components/handler/cesium/Camera";
import useDidMountEffect from "@/components/module/useDidMountEffect";

export default function Area() {
  const viewerRef = useRef(null);

  const [drawArea, setDrawArea] = useState(false);
  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
    });

    viewerRef.current = viewer;

    defaultCamera(viewer, [-114.7377325, 36.0160655, 1000]);

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const viewer = viewerRef.current;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    let activeShapePoints = [];
    let activeShape;
    let floatingPoint;

    if (drawArea) {
      handler.setInputAction((click) => {
        const ray = viewer.camera.getPickRay(click.position);
        const clickPosition = viewer.scene.globe.pick(ray, viewer.scene);
        if (Cesium.defined(clickPosition)) {
          //   const cartographic = Cesium.Cartographic.fromCartesian(clickPosition);
          //   const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          //   const latitude = Cesium.Math.toDegrees(cartographic.latitude);

          if (activeShapePoints.length === 0) {
            // first click
            floatingPoint = viewer.entities.add({
              position: clickPosition,
              point: {
                pixelSize: 6,
                color: Cesium.Color.SKYBLUE,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 1,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
              //   longitude: longitude,
              //   latitude: latitude,
            });
            activeShapePoints.push(clickPosition);
            // first click시 activeShapePoints를 감시해 PolygonHierarchy를 리턴하는 콜백 함수 등록
            const dynamicPositions = new Cesium.CallbackProperty(() => {
              return new Cesium.PolygonHierarchy(activeShapePoints);
            }, false);

            activeShape = viewer.entities.add({
              polygon: {
                hierarchy: dynamicPositions,
                material: new Cesium.ColorMaterialProperty(
                  Cesium.Color.SKYBLUE.withAlpha(0.5),
                ),
              },
            });
          }
          activeShapePoints.push(clickPosition);
          viewer.entities.add({
            position: clickPosition,
            point: {
              pixelSize: 6,
              color: Cesium.Color.SKYBLUE,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 1,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            // longitude: longitude,
            // latitude: latitude,
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((movement) => {
        // first click 이후 movement 이벤트
        if (Cesium.defined(floatingPoint)) {
          const ray = viewer.camera.getPickRay(movement.endPosition);
          const newPosition = viewer.scene.globe.pick(ray, viewer.scene);
          if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            // 마우스가 움직일때마다 이전 위치 pop, 새로운 위치 push
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(() => {
        activeShapePoints.pop();
        viewer.entities.add({
          polygon: {
            hierarchy: activeShapePoints,
            material: new Cesium.ColorMaterialProperty(
              Cesium.Color.SKYBLUE.withAlpha(0.5),
            ),
          },
        });
        viewer.entities.remove(floatingPoint);
        viewer.entities.remove(activeShape);
        floatingPoint = null;
        activeShape = null;
        activeShapePoints = [];
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    return () => {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
  }, [drawArea]);

  // TODO: 세가지 이벤트 겹칠때? : 다른 위젯 x로 전환? cursor Pointer?

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => {
          setDrawArea(true);
        }}
      >
        Start Drawing Area
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          setDrawArea(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
