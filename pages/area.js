import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { defaultCamera } from "@/components/handler/cesium/Camera";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import {
  calculateArea,
  createAreaPoint,
  createAreaPolygon,
} from "@/components/handler/cesium/Entity";
import {
  getRayPosition,
  getCoordinate,
} from "@/components/handler/cesium/measurement/GeoInfo";

// TODO: 코드 단순화(함수화), drag 기능, 직선으로 면적?(구글 어스)
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

    defaultCamera(viewer, [127.08018445000782, 37.635648085178175, 1000]);

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const viewer = viewerRef.current;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    let floatingPoint;
    let activeShapePoints = [];
    let activeShape;
    let addedPointArr = [];
    let addedPointCoordinate = [];

    if (drawArea) {
      handler.setInputAction((click) => {
        const clickPosition = getRayPosition({
          viewer,
          position: click.position,
        });
        if (Cesium.defined(clickPosition)) {
          const [longitude, latitude] = getCoordinate(clickPosition);
          addedPointCoordinate.push([longitude, latitude]);

          // first click
          if (activeShapePoints.length === 0) {
            floatingPoint = createAreaPoint({
              viewer,
              position: clickPosition,
            });
            activeShapePoints.push(clickPosition);

            // first click시 activeShapePoints를 감시해 PolygonHierarchy를 리턴하는 콜백 함수 등록
            const dynamicPositions = new Cesium.CallbackProperty(() => {
              return new Cesium.PolygonHierarchy(activeShapePoints);
            }, false);

            // 예상 Polygon
            activeShape = createAreaPolygon({
              viewer,
              hierarchy: dynamicPositions,
            });
          }
          const addedPoint = createAreaPoint({
            viewer,
            position: clickPosition,
          });
          activeShapePoints.push(clickPosition);
          addedPointArr.push(addedPoint);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((movement) => {
        // first click 이후 movement 이벤트
        if (Cesium.defined(floatingPoint)) {
          const newPosition = getRayPosition({
            viewer,
            position: movement.endPosition,
          });
          if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            // 마우스가 움직일때마다 이전 위치 pop, 새로운 위치 push
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // 마우스 우클릭 시 동적으로 생성되던 entity 제거하고 hierarchy 기반으로 polygon 재생성
      handler.setInputAction(() => {
        activeShapePoints.pop();
        if (addedPointArr.length > 2) {
          createAreaPolygon({ viewer, hierarchy: activeShapePoints });
          // 시작점과 끝점이 일치되어야 함
          addedPointCoordinate.push(addedPointCoordinate[0]);

          const area = calculateArea(addedPointCoordinate);

          console.log(`폴리곤의 면적: ${area} 제곱미터`);
        } else {
          addedPointArr.forEach((element) => {
            viewer.entities.remove(element);
          });
        }

        viewer.entities.remove(floatingPoint);
        viewer.entities.remove(activeShape);
        floatingPoint = null;
        activeShape = null;
        activeShapePoints = [];
        addedPointArr = [];
        addedPointCoordinate = [];
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
