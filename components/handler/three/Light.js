import * as THREE from "three";
/**
 * @description 내부 건물을 기준으로 일정 높이 이상 4방향으로 directionLight 제공
 */
function fourWayDirectionLight(modelSize, scene) {
  const [gridWidth, gridLength, altitude] = modelSize;

  // 조명 높이
  const lightHeight = 30;

  for (let x of gridWidth) {
    for (let z of gridLength) {
      const directionalLight = new THREE.DirectionalLight(0xffffe0, 1);
      // 층별 조명 높이 설정
      directionalLight.position.set(x, lightHeight + altitude, z);
      scene.add(directionalLight);
    }
  }
}

export { fourWayDirectionLight };
