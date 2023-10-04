import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import useDidMountEffect from "../module/useDidMountEffect";
import { PlayCircle, Plus } from "react-bootstrap-icons";
import {
  rendererCleanUp,
  rendererConfig,
  resizeRenderer,
} from "../module/Renderer";
import { fourWayDirectionLight } from "../handler/three/Light";

export default function FirstPerson({
  filePath,
  loadingState,
  cameraFlagState,
}) {
  const [initialCameraPosition, setInitialCameraPosition] = useState(null);
  const [playClicked, setPlayClicked] = useState(false);
  const [isIntersect, setIsIntersect] = useState(false);

  const { loading, setLoading } = loadingState;
  const { initCameraFlag, setInitCameraFlag } = cameraFlagState;

  const targetRef = useRef(null);
  const cameraRef = useRef(null);
  // 4층 기준 카메라 초기 위치
  const firstCameraPosition = [-9, 2, 0];

  useEffect(() => {
    // scene, camera 생성
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // renderer 생성 후 container에 삽입
    const renderer = rendererConfig();
    const container = document.querySelector("#container");
    container.appendChild(renderer.domElement);

    // 내부 구조 가로, 세로, 높이
    let gridWidth, gridLength, altitude;

    // glb 모델 추가
    const loader = new GLTFLoader();
    loader.load(
      filePath,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);

        // 모델 사이즈 측정
        const boundingBox = new THREE.Box3().setFromObject(model);
        const lowestPoint = boundingBox.min.y;
        altitude = lowestPoint;
        gridWidth = [
          Math.round(boundingBox.min.x),
          Math.round(boundingBox.max.x),
        ];
        gridLength = [
          Math.round(boundingBox.min.z),
          Math.round(boundingBox.max.z),
        ];

        scene.add(model);

        // 모델의 높이 바탕으로 camera y값 조정
        const newCameraPosition = [...firstCameraPosition];
        newCameraPosition[1] += altitude;
        setInitialCameraPosition(newCameraPosition);
        camera.position.set(...newCameraPosition);
        cameraRef.current = camera;

        const modelSize = [gridWidth, gridLength, altitude];

        // 모델에 대한 조명 설정
        fourWayDirectionLight(modelSize, scene);
      },
      undefined,
      (error) => {
        console.error(error);
      },
    );

    // 내부 object TODO: 광선이 벽 통과
    loader.load(
      "glb/airplane.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.02, 0.02, 0.02);
        model.position.set(-0.5, 0.7, 5.2);
        scene.add(model);
        // target에 모델 설정 //TODO: 배열로 변경
        targetRef.current = model;
      },
      undefined,
      (error) => {
        console.error(error);
      },
    );

    // 마우스 움직임에 따라 시점이 변경되도록 PointerLockControls 설정
    const controls = new PointerLockControls(camera, document.body);

    const playButton = document.getElementById("playButton");
    playButton.addEventListener("click", () => {
      // lock, unlock 변경 시간 1.25초 보다 아래 시 콘솔에 에러 출력
      controls.lock();
    });

    controls.addEventListener("lock", () => {
      setPlayClicked(true);
    });

    controls.addEventListener("unlock", () => {
      setPlayClicked(false);
    });

    // 방향키
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    const onKeyDown = function (event) {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          moveForward = true;
          break;
        case 37: // left
        case 65: // a
          moveLeft = true;
          break;
        case 40: // down
        case 83: // s
          moveBackward = true;
          break;
        case 39: // right
        case 68: // d
          moveRight = true;
          break;
      }
    };

    const onKeyUp = function (event) {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          moveForward = false;
          break;
        case 37: // left
        case 65: // a
          moveLeft = false;
          break;
        case 40: // down
        case 83: // s
          moveBackward = false;
          break;
        case 39: // right
        case 68: // d
          moveRight = false;
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);

    // Check collision with the grid
    function checkCollision(position) {
      const margin = 1;

      if (
        position.x < gridWidth[0] + margin ||
        position.x > gridWidth[1] - margin ||
        position.z < gridLength[0] + margin ||
        position.z > gridLength[1] - margin
      ) {
        return true;
      }

      return false;
    }

    // render
    function animate() {
      requestAnimationFrame(animate);

      if (controls.isLocked) {
        // 속도
        const delta = 0.08;

        if (controls.isLocked) {
          if (moveForward) {
            controls.moveForward(delta);
            if (checkCollision(controls.getObject().position)) {
              controls.moveForward(-delta);
            }
          }

          if (moveBackward) {
            controls.moveForward(-delta);
            if (checkCollision(controls.getObject().position)) {
              controls.moveForward(delta);
            }
          }

          if (moveLeft) {
            controls.moveRight(-delta);
            if (checkCollision(controls.getObject().position)) {
              controls.moveRight(delta);
            }
          }

          if (moveRight) {
            controls.moveRight(delta);
            if (checkCollision(controls.getObject().position)) {
              controls.moveRight(-delta);
            }
          }
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    resizeRenderer(camera, renderer);

    setLoading(false);

    return () => {
      document.removeEventListener("keydown", onKeyDown, false);
      document.removeEventListener("keyup", onKeyUp, false);
      rendererCleanUp(controls, renderer);
    };
  }, []);

  // 카메라 위치 초기화
  useDidMountEffect(() => {
    if (initialCameraPosition && initCameraFlag) {
      const camera = cameraRef.current;
      camera.position.set(...initialCameraPosition);
      setInitCameraFlag(false);
    }
  }, [initCameraFlag, initialCameraPosition]);

  // Ray Event
  useEffect(() => {
    const camera = cameraRef.current;
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    if (playClicked && targetRef.current) {
      const onMouseMove = (event) => {
        // 마우스 좌표를 정규화된 디바이스 좌표로 변환
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // raycaster 설정
        raycaster.setFromCamera(mouse, camera);

        // 겹치는 객체를 찾음
        const intersects = raycaster.intersectObjects([targetRef.current]);

        // 겹치는 객체가 있을 때의 처리
        if (intersects.length > 0) {
          setIsIntersect(true);
        } else {
          setIsIntersect(false);
        }
      };

      document.addEventListener("mousemove", onMouseMove);

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
      };
    }
  }, [playClicked]);

  return (
    <>
      <div id="container">
        <PlayCircle
          id="playButton"
          className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer text-2xl text-slate-200 ${
            loading || playClicked ? "hidden" : ""
          }`}
        />
        <Plus
          className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform text-xl text-red-600 ${
            !playClicked ? "hidden" : ""
          }`}
        />
        {playClicked && isIntersect ? (
          <table className="fixed left-24 top-1/2 z-50 flex -translate-y-1/2 transform flex-col justify-center rounded-md border-2 border-black bg-gray-200 p-2 opacity-70">
            <thead className="flex justify-center">
              <tr>
                <th className="border-b px-4 py-2 text-center">Description</th>
              </tr>
            </thead>
            <tbody className="text-center">
              <tr>
                <td className="border-b px-8 py-2">이름</td>
                <td className="border-b px-8 py-2">-</td>
              </tr>
              <tr>
                <td className="border-b px-8 py-2">직책</td>
                <td className="border-b px-8 py-2">-</td>
              </tr>
              <tr>
                <td className="border-b px-8 py-2">업무</td>
                <td className="border-b px-8 py-2">-</td>
              </tr>
              <tr>
                <td className="border-b px-8 py-2">위치</td>
                <td className="border-b px-8 py-2">-</td>
              </tr>
            </tbody>
          </table>
        ) : null}
      </div>
    </>
  );
}
