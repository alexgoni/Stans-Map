import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

export default class FirstPersonController {
  static FOURTH_FLOOR_POSITION = [-9, 2, 0];
  static TARGET_URL = "glb/airplane.glb";
  static TARGET_SCALE = [0.02, 0.02, 0.02];
  static TARGET_POSITION = [-0.5, 0.7, 5.2];

  constructor(container, filePath) {
    this.container = container;
    this.filePath = filePath;
    this.loader = new GLTFLoader();
  }

  initThree(setLoading, setIsPlay) {
    this.#setUpScene();
    this.#addSpaceAndSetUp(setLoading);
    this.#addObject();
    this.#lockPointer(setIsPlay);
    this.#setUpArrowKeyControls();
    this.#animate();
  }

  turnOnRay(isPlay, setIsIntersect) {
    if (!isPlay) return;

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (event) => {
      // 마우스 좌표를 정규화된 디바이스 좌표로 변환
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects([this.target]);

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

  resetCameraPosition(resetCameraPositionFlag, setResetCameraPositionFlag) {
    if (!resetCameraPositionFlag) return;

    this.camera.position.set(...this.initialCameraPosition);
    setResetCameraPositionFlag(false);
  }

  cleanUpThree() {
    this.controls.dispose();

    const domElement = this.renderer.domElement;
    domElement.parentNode.removeChild(domElement);
    this.renderer.dispose();
  }

  #setUpScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    this.renderer = this.#rendererConfig();
    this.#resizeRenderer();
    this.container.appendChild(this.renderer.domElement);
  }

  #addSpaceAndSetUp(setLoading) {
    this.loader.load(
      this.filePath,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        this.scene.add(model);

        this.#measureModelSize(model);
        this.#setInitialCameraPosition();
        this.#fourWayDirectionLight();
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error(error);
      },
    );
  }

  #addObject() {
    this.loader.load(
      FirstPersonController.TARGET_URL,
      (gltf) => {
        this.target = gltf.scene;
        this.target.scale.set(...FirstPersonController.TARGET_SCALE);
        this.target.position.set(...FirstPersonController.TARGET_POSITION);
        this.scene.add(this.target);
      },
      undefined,
      (error) => {
        console.error(error);
      },
    );
  }

  #lockPointer(setIsPlay) {
    this.controls = new PointerLockControls(this.camera, document.body);

    const playButton = document.getElementById("playButton");
    playButton.addEventListener("click", () => {
      // lock, unlock 변경 시간 1.25초 보다 아래 시 콘솔에 에러 출력
      this.controls.lock();
    });

    this.controls.addEventListener("lock", () => {
      setIsPlay(true);
    });

    this.controls.addEventListener("unlock", () => {
      setIsPlay(false);
    });
  }

  #setUpArrowKeyControls() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    const onKeyDown = (event) => {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          this.moveForward = true;
          break;
        case 37: // left
        case 65: // a
          this.moveLeft = true;
          break;
        case 40: // down
        case 83: // s
          this.moveBackward = true;
          break;
        case 39: // right
        case 68: // d
          this.moveRight = true;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.keyCode) {
        case 38: // up
        case 87: // w
          this.moveForward = false;
          break;
        case 37: // left
        case 65: // a
          this.moveLeft = false;
          break;
        case 40: // down
        case 83: // s
          this.moveBackward = false;
          break;
        case 39: // right
        case 68: // d
          this.moveRight = false;
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
  }

  #animate() {
    const VELOCITY = 0.08;
    requestAnimationFrame(this.#animate.bind(this));

    if (this.controls.isLocked) {
      const currentPosition = this.controls.getObject().position;
      if (this.moveForward) {
        this.controls.moveForward(VELOCITY);
        if (this.#checkCollision(currentPosition)) {
          this.controls.moveForward(-VELOCITY);
        }
      }

      if (this.moveBackward) {
        this.controls.moveForward(-VELOCITY);
        if (this.#checkCollision(currentPosition)) {
          this.controls.moveForward(VELOCITY);
        }
      }

      if (this.moveLeft) {
        this.controls.moveRight(-VELOCITY);
        if (this.#checkCollision(currentPosition)) {
          this.controls.moveRight(VELOCITY);
        }
      }

      if (this.moveRight) {
        this.controls.moveRight(VELOCITY);
        if (this.#checkCollision(currentPosition)) {
          this.controls.moveRight(-VELOCITY);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  #checkCollision(position) {
    const margin = 1;

    if (
      position.x < this.gridWidth[0] + margin ||
      position.x > this.gridWidth[1] - margin ||
      position.z < this.gridLength[0] + margin ||
      position.z > this.gridLength[1] - margin
    ) {
      return true;
    }

    return false;
  }

  #rendererConfig() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.setClearColor(0x87ceeb, 0);
    renderer.domElement.style.position = "fixed";
    renderer.domElement.id = "renderer";
    renderer.domElement.style.zIndex = "30";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.top = "0";

    return renderer;
  }

  #resizeRenderer() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  #measureModelSize(model) {
    const boundingBox = new THREE.Box3().setFromObject(model);
    const lowestPoint = boundingBox.min.y;
    this.altitude = lowestPoint;
    this.gridWidth = [
      Math.round(boundingBox.min.x),
      Math.round(boundingBox.max.x),
    ];
    this.gridLength = [
      Math.round(boundingBox.min.z),
      Math.round(boundingBox.max.z),
    ];
  }

  #setInitialCameraPosition() {
    const initialCameraPosition = [
      ...FirstPersonController.FOURTH_FLOOR_POSITION,
    ];
    initialCameraPosition[1] += this.altitude;
    this.initialCameraPosition = initialCameraPosition;
    this.camera.position.set(...this.initialCameraPosition);
  }

  #fourWayDirectionLight() {
    const LIGHT_HEIGHT = 30;

    for (let x of this.gridWidth) {
      for (let z of this.gridLength) {
        const directionalLight = new THREE.DirectionalLight(0xffffe0, 1);
        // 층별 조명 높이 설정
        directionalLight.position.set(x, LIGHT_HEIGHT + this.altitude, z);
        this.scene.add(directionalLight);
      }
    }
  }
}
