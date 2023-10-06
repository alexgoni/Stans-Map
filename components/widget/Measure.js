import * as Cesium from "cesium";
import { Clipboard, Rulers, XLg } from "react-bootstrap-icons";

function disableCameraMotion(viewer, state) {
  viewer.scene.screenSpaceCameraController.enableRotate = state;
  viewer.scene.screenSpaceCameraController.enableZoom = state;
  viewer.scene.screenSpaceCameraController.enableLook = state;
  viewer.scene.screenSpaceCameraController.enableTilt = state;
  viewer.scene.screenSpaceCameraController.enableTranslate = state;
}

function MeasureWidget({ widgetOpen, setWidgetOpen, surfaceDistance }) {
  const copyToClipboard = (surfaceDistance) => {
    navigator.clipboard
      .writeText(surfaceDistance)
      .then(() => {
        alert("copy!");
      })
      .catch((err) => {
        console.error("복사 실패:", err);
      });
  };

  return (
    <>
      <div
        className="fixed bottom-8 left-10 flex cursor-pointer items-center justify-center rounded-md border-b-4 border-slate-700 bg-slate-600 p-4 shadow-xl hover:border-slate-500 hover:bg-slate-400"
        onClick={() => {
          setWidgetOpen(!widgetOpen);
        }}
      >
        {widgetOpen ? (
          <XLg className="text-2xl text-gray-200" />
        ) : (
          <Rulers className="text-2xl text-gray-200" />
        )}
      </div>

      {widgetOpen ? (
        <div className="fixed bottom-8 left-1/2 z-10 -translate-x-1/2 transform rounded-sm bg-slate-100 p-4 shadow-2xl">
          <div className="flex justify-between">
            <p className="text-xs text-gray-900">거리 측정</p>
            <XLg
              className="cursor-pointer text-sm text-gray-500 hover:text-gray-900"
              onClick={() => {
                setWidgetOpen(false);
              }}
            />
          </div>

          <div className="mt-1 flex items-center justify-between gap-7">
            <p className="text-sm font-medium text-black">
              총 거리 :
              {surfaceDistance < 1000
                ? " " + surfaceDistance.toFixed(2) + " m"
                : " " + (surfaceDistance / 1000).toFixed(2) + " km"}
            </p>
            <Clipboard
              className="-mr-1.5 mt-0.5 cursor-pointer p-1 text-3xl text-indigo-400 hover:text-indigo-600"
              onClick={() => copyToClipboard(surfaceDistance)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

function pointEvent({ viewer, handler, widgetOpen, setSurfaceDistance }) {
  let isDragging = false;
  let draggedEntity = null;

  let startPoint = null;
  let endPoint = null;
  let polyline = null;

  let startDistance = null;
  let endDistance = null;

  const cesiumContainer = document.getElementById("cesiumContainer");

  widgetOpen
    ? (cesiumContainer.style.cursor = "crosshair")
    : (() => {
        cesiumContainer.style.cursor = "default";
        // widget관련 entity만 제거해야 함
        viewer.entities.removeById("start_point");
        viewer.entities.removeById("end_point");
        viewer.entities.removeById("polyline");
        setSurfaceDistance(0);
      })();

  // click to create points
  handler.setInputAction((click) => {
    // event handler가 등록되는 시점의 state. 외부의 변화를 참조하지 않는다.
    if (!widgetOpen) return;

    const cartesian = viewer.camera.pickEllipsoid(click.position);

    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);

      if (!startPoint) {
        startPoint = viewer.entities.add({
          id: "start_point",
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
          point: {
            pixelSize: 10,
            color: Cesium.Color.BLACK,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          longitude: longitude,
          latitude: latitude,
        });
      } else if (!endPoint) {
        endPoint = viewer.entities.add({
          id: "end_point",
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
          point: {
            pixelSize: 10,
            color: Cesium.Color.BLACK,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          longitude: longitude,
          latitude: latitude,
        });

        const positionsDegrees = [
          startPoint.longitude,
          startPoint.latitude,
          0,
          endPoint.longitude,
          endPoint.latitude,
          0,
        ];

        const positionsCartesian3 =
          Cesium.Cartesian3.fromDegreesArrayHeights(positionsDegrees);

        polyline = viewer.entities.add({
          id: "polyline",
          polyline: {
            positions: positionsCartesian3,
            width: 5,
            material: Cesium.Color.BLACK,
          },
        });

        cesiumContainer.style.cursor = "default";

        startDistance = Cesium.Cartographic.fromDegrees(
          startPoint.longitude,
          startPoint.latitude,
        );
        endDistance = Cesium.Cartographic.fromDegrees(
          endPoint.longitude,
          endPoint.latitude,
        );

        const ellipsoid = Cesium.Ellipsoid.WGS84;
        const geodesic = new Cesium.EllipsoidGeodesic(
          startDistance,
          endDistance,
          ellipsoid,
        );
        const surfaceDistance = geodesic.surfaceDistance;

        setSurfaceDistance(surfaceDistance);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // drag event
  handler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position);
    if (
      Cesium.defined(pickedObject) &&
      (pickedObject.id === startPoint || pickedObject.id === endPoint)
    ) {
      isDragging = true;
      draggedEntity = pickedObject.id;
      disableCameraMotion(viewer, false);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  handler.setInputAction((movement) => {
    if (isDragging && draggedEntity) {
      const cartesian = viewer.camera.pickEllipsoid(movement.endPosition);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        draggedEntity.longitude = longitude;
        draggedEntity.latitude = latitude;
        draggedEntity.position = Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
        );

        const positionsDegrees = [
          startPoint.longitude,
          startPoint.latitude,
          0,
          endPoint.longitude,
          endPoint.latitude,
          0,
        ];

        const positionsCartesian3 =
          Cesium.Cartesian3.fromDegreesArrayHeights(positionsDegrees);

        // polyline 업데이트
        polyline.polyline.positions = new Cesium.CallbackProperty(
          () => positionsCartesian3,
          false,
        );

        startDistance = Cesium.Cartographic.fromDegrees(
          startPoint.longitude,
          startPoint.latitude,
        );
        endDistance = Cesium.Cartographic.fromDegrees(
          endPoint.longitude,
          endPoint.latitude,
        );

        const ellipsoid = Cesium.Ellipsoid.WGS84;
        const geodesic = new Cesium.EllipsoidGeodesic(
          startDistance,
          endDistance,
          ellipsoid,
        );
        const surfaceDistance = geodesic.surfaceDistance;

        setSurfaceDistance(surfaceDistance);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  handler.setInputAction(() => {
    isDragging = false;
    draggedEntity = null;
    disableCameraMotion(viewer, true);
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
}

export { MeasureWidget, pointEvent };
