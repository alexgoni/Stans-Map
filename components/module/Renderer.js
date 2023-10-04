import * as THREE from "three";

function rendererConfig() {
  // Create the renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // Configure renderer settings
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

function resizeRenderer(camera, renderer) {
  // Resize renderer when window size changes
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function rendererCleanUp(controls, renderer) {
  controls.dispose();

  // Remove renderer's DOM element
  const domElement = renderer.domElement;
  domElement.parentNode.removeChild(domElement);

  // Dispose the renderer to free up resources
  renderer.dispose();
}

export { rendererConfig, resizeRenderer, rendererCleanUp };
