import Viewer from "@/components/handler/cesium/Viewer";
import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import { defaultCamera } from "@/components/handler/cesium/Camera";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import {
  getCoordinate,
  getRayPosition,
} from "@/components/handler/cesium/measurement/GeoInfo";
import { createMeasurePoint } from "@/components/handler/cesium/Entity";

// TODO: Class 도입
export default function line() {
  const [drawLine, setDrawLine] = useState(false);
  const viewerRef = useRef(null);

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
    let movePoint = null;
    let activeLine;
    let pointArr = [];
    let pointCoordinateArr = [];

    if (drawLine) {
      handler.setInputAction((click) => {
        const clickPosition = getRayPosition({
          viewer,
          position: click.position,
        });
        if (Cesium.defined(clickPosition)) {
          //first click
          if (pointArr.length === 0) {
            floatingPoint = createMeasurePoint({
              viewer,
              position: clickPosition,
              geoInfo: getCoordinate(clickPosition),
            });
          }
          const point = createMeasurePoint({
            viewer,
            position: clickPosition,
            geoInfo: getCoordinate(clickPosition),
          });
          pointArr.push(point);
          if (pointArr.length === 1) {
            const dynamicPolylinePosition = new Cesium.CallbackProperty(() => {
              const prevLongitude = pointArr[pointArr.length - 1].longitude;
              const prevLatitude = pointArr[pointArr.length - 1].latitude;

              if (movePoint !== null) {
                return [
                  Cesium.Cartesian3.fromDegrees(prevLongitude, prevLatitude),
                  Cesium.Cartesian3.fromDegrees(
                    movePoint.longitude,
                    movePoint.latitude,
                  ),
                ];
              }
            }, false);
            activeLine = viewer.entities.add({
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
          pointCoordinateArr.push([point.longitude, point.latitude]);
          const polyline = viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(
                pointCoordinateArr.flat(),
              ),
              width: 5,
              clampToGround: true, // 지상 위로 표시
              material: Cesium.Color.GOLD,
            },
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handler.setInputAction((movement) => {
        if (Cesium.defined(floatingPoint)) {
          const newPosition = getRayPosition({
            viewer,
            position: movement.endPosition,
          });
          if (Cesium.defined(newPosition)) {
            const [longitude, latitude] = getCoordinate(newPosition);
            floatingPoint.position.setValue(newPosition);
            movePoint = { longitude, latitude };
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handler.setInputAction(() => {
        if (pointArr.length === 1) {
          viewer.entities.remove(pointArr[0]);
        }

        const line = turf.lineString(pointCoordinateArr);
        const distance = turf.lineDistance(line, { units: "kilometers" });
        console.log("Distance along the line:", distance, "kilometers");

        viewer.entities.remove(floatingPoint);
        viewer.entities.remove(activeLine);
        floatingPoint = null;
        activeLine = null;
        movePoint = null;
        // TODO: drag 위해 arr 저장할 필요
        pointArr = [];
        pointCoordinateArr = [];
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    return () => {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
  }, [drawLine]);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => {
          setDrawLine(true);
        }}
      >
        Start Drawing line
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          setDrawLine(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
