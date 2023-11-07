import { rendererCleanUp, rendererConfig } from "@/components/module/Renderer";
import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function Three() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    camera.position.set(0, 10, 0); // 카메라 위치 설정

    const light = new THREE.AmbientLight(0xffffff, 4); // 흰색 빛
    scene.add(light);

    // renderer 생성 후 container에 삽입
    const renderer = rendererConfig();

    const container = document.querySelector("#container");
    container.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load(
      "glb/airplane.glb",
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error(error);
      },
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 부드러운 감속 설정

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update(); // OrbitControls 업데이트
    }

    animate();

    return () => {
      rendererCleanUp(controls, renderer);
    };
  }, []);

  return <div id="container"></div>;
}
