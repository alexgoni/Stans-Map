import { addModelEntity } from "@/components/handler/cesium/Entity";
import Viewer from "@/components/handler/cesium/Viewer";
import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { PlayFill, StopFill } from "react-bootstrap-icons";

export default function Drone() {
  const [anglePerSecond, setAnglePerSecond] = useState(10);
  const [direction, setDirection] = useState("오른쪽");
  const [play, setPlay] = useState(false);
  const [distance, setDistance] = useState(250);
  const [pitch, setPitch] = useState(-30);
  const animationIdRef = useRef(null);

  const viewerRef = useRef(null);

  const centerPoint = Cesium.Cartesian3.fromDegrees(127.08049, 37.63457, 15);
  /**
   * @params heading (가로 설정)
   * @params pitch (세로 설정)
   * @parmas distance
   */
  const [currentCameraPosition, setCurrentCameraPosition] = useState([
    Cesium.Math.toRadians(45),
    Cesium.Math.toRadians(pitch),
    distance,
  ]);

  function rotateCameraAruoundPoint({
    camera,
    centerPoint,
    angle,
    currentCameraPosition,
  }) {
    const [heading] = currentCameraPosition;
    const startHeading = heading;
    let startTime = null;

    function animate(time) {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / 1000;
      const newHeading = Cesium.Math.lerp(
        startHeading,
        startHeading + angle,
        progress,
      );

      if (distance === 0) debugger;

      camera.lookAt(
        centerPoint,
        new Cesium.HeadingPitchRange(
          newHeading,
          Cesium.Math.toRadians(pitch),
          distance,
        ),
      );
      setCurrentCameraPosition([
        newHeading,
        Cesium.Math.toRadians(pitch),
        distance,
      ]);

      animationIdRef.current = requestAnimationFrame(animate); // Update the useRef
    }

    animationIdRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    const geomap = new Cesium.WebMapServiceImageryProvider({
      url: "http://192.168.1.45:8188/geoserver/wms",
      parameters: {
        format: "image/png",
        transparent: "true",
        tiled: true,
        enablePickFeatures: true,
      },
      layers: "stans:protoMap",
      maximumLevel: 20,
    });

    // viewer 생성
    const viewer = Viewer({
      img: geomap,
      animation: false,
      baseLayerPicker: false,
    });

    // 충돌 무시
    // viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewerRef.current = viewer;

    // tecno 생성
    const tecnoPosition = [127.08049, 37.63457, 0];
    const tecnoOrientation = [105, 0, 0];
    const tecnoInfo = {
      name: "Tecno Building",
      description: "STANS 4th floor",
      model: {
        uri: "/glb/tecno.glb",
        scale: 0.01,
      },
    };

    const tecno = addModelEntity({
      viewer,
      position: tecnoPosition,
      orientation: tecnoOrientation,
      modelInfo: tecnoInfo,
    });

    // Camera 설정
    viewer.camera.lookAt(
      centerPoint,
      new Cesium.HeadingPitchRange(...currentCameraPosition),
    );

    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (play) {
      const rotationVelocity =
        direction === "오른쪽" ? anglePerSecond * -1 : anglePerSecond;

      // Clear previous animation frame if it exists
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      // Start new animation
      rotateCameraAruoundPoint({
        camera: viewer.camera,
        centerPoint,
        angle: Cesium.Math.toRadians(rotationVelocity),
        currentCameraPosition,
      });
    } else {
      // Stop animation if play is false
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      viewer.camera.lookAt(
        centerPoint,
        new Cesium.HeadingPitchRange(...currentCameraPosition),
      );
    }

    // Update the camera distance
    setCurrentCameraPosition((prev) => {
      return [prev[0], Cesium.Math.toRadians(pitch), distance];
    });
  }, [play, direction, anglePerSecond, distance, pitch]);

  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      <div className="fixed left-6 top-6 rounded-sm bg-slate-200 p-2 opacity-90 shadow-xl">
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <div
              className="w-16 cursor-pointer rounded-md border-2 border-gray-400 px-2 text-center"
              onClick={() => {
                direction === "오른쪽"
                  ? setDirection("왼쪽")
                  : setDirection("오른쪽");
              }}
            >
              <span className="text-sm">{direction}</span>
            </div>
            <div className="flex w-6 cursor-pointer items-center justify-center rounded-md border-2 border-gray-500">
              {play ? (
                <StopFill
                  className="text-lg text-gray-500"
                  onClick={() => setPlay(false)}
                />
              ) : (
                <PlayFill
                  className="text-xl text-gray-500"
                  onClick={() => setPlay(true)}
                />
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <span>속도</span>
            <input
              type="number"
              min="0"
              max="90"
              step="1"
              value={anglePerSecond}
              onChange={(e) => setAnglePerSecond(e.target.value)}
              className="w-16 text-center"
            />
          </div>
          <div className="flex gap-2">
            <span>거리</span>
            <input
              type="number"
              min="50"
              max="1000"
              step="10"
              value={distance || 1}
              onChange={(e) =>
                setDistance(() => {
                  let num = Number(e.target?.value);
                  if (num == 0) num = 10;
                  return num;
                })
              }
              className="w-16 text-center"
            />
          </div>
          <div className="flex gap-2">
            <span>각도</span>
            <input
              type="number"
              min="0"
              max="90"
              step="1"
              value={-1 * pitch}
              onChange={(e) => setPitch(-1 * e.target.value)}
              className="w-16 text-center"
            />
          </div>
        </div>
      </div>
    </>
  );
}
