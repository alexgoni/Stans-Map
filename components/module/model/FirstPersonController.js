import { rendererConfig } from "@/components/handler/three/Renderer";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default class FirstPersonController {
  // 4층 기준 카메라 초기 위치
  static FIRST_CAMERA_POSITION = [-9, 2, 0];

  constructor(container, filePath) {
    this.container = container;
    this.filePath = filePath;
    this.loader = new GLTFLoader();
  }

  initThree() {
    this.#setUpScene();
  }

  #setUpScene() {
    // scene, camera 생성
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    // renderer 생성 후 container에 삽입
    this.renderer = rendererConfig();
    this.container.appendChild(this.renderer.domElement);
  }

  addSpaceAndSetUp() {
    this.loader.load(this.filePath, (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      this.scene.add(model);

      const { altitude, gridWidth, gridLength } = this.#measureModelSize(model);
    });
  }

  #measureModelSize(model) {
    const boundingBox = new THREE.Box3().setFromObject(model);
    const lowestPoint = boundingBox.min.y;
    const altitude = lowestPoint;
    const gridWidth = [
      Math.round(boundingBox.min.x),
      Math.round(boundingBox.max.x),
    ];
    const gridLength = [
      Math.round(boundingBox.min.z),
      Math.round(boundingBox.max.z),
    ];

    return { altitude, gridWidth, gridLength };
  }

  addObject() {}

  lockPointer() {}

  setUpArrowKeyControls() {}

  render() {}

  turnOnRay() {}

  resetCameraPosition() {}
}
