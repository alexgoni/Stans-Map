### 지형 정보 수정

지형 정보 수정이 가능한지

- ClipingPlane : 지형 정보를 수정할 수는 없더라도 안보이게 한다.

지형정보가 없을때: 모델을 땅에 고정하지 못한다.

### offline 환경

cesium ion 사용 : geocode, imagelayer, baseLayer(기본 이미지 레이어)

제외를 해야 offline에서 globe가 나타남

https://community.cesium.com/t/cesiumjs-ion-in-an-offline-environment/8738/4

https://sandcastle.cesium.com/index.html?src=Offline.html

https://github.com/CesiumGS/cesium/tree/main/Documentation/OfflineGuide

https://community.cesium.com/t/invalid-access-token-when-not-using-ion/7563/4

https://community.cesium.com/t/3dtileset-disappear-when-too-close-with-cesiumpolygonrasteroverlay/24083/24

---

### 세부 설명

### createWorldTerrain()

- CustomCesiumTerrainProvider 생성하고 매개변수로 terrainProvider 전달

### CustomTerrainProvider

- CesiumTerrainProvider 상속
- setFloor

  - floorHeight에 높이 등록
  - 영역을 감싸는 smallest rectangle 생성
  - turf polygon 생성

- requestTileGeometry
  - CesiumTerrainProvider의 requestTileGeometry 오버라이드
  - zoomLevel이나 카메라의 위치가 바뀜에 따라 계속해서 호출된다.
  - 외부의 requestTileGeometry 함수 호출한 결과를 반환한다.

### requestTileGeometry

- tile의 terrain date를 요청한다.
- 응답 결과의 조건에 맞추어 createQuantizedMeshTerrainData를 호출한다.

### createQuantizedMeshTerrainData

- 이진 데이터 다루는 함수
- terrain을 수정한다.
- QuantizedMeshTerrainData 클래스 이용

---

### Flow

1. viewer에 terrainProvider로 custom terrain 데이터 넘겨줌
2. setFloor로 영역에 대해 원하는 높이 설정
3. 카메라가 움직임에 따라 requestGeometry 함수 호출

---

### 우려사항

- [] cesium Ion 데이터만 가능한지, localhost:8081의 terrain data도 적용이 되는지 확인
- [] zoom level에 따라 타일 안보이는 현상
- [] 깎인 부분 아래로 카메라를 가져갔을 때 scene이 잘 안보이는 현상
- [] 변화하는 높이가 클수록, 영역이 클수록 버그가 많아짐
- [] 스크롤 오작동

---

### 적용

options.url => deprecated

CesiumTerrainProvider 를 생성하는 방식이 버전업 되면서 바뀜 (1.107)

1. 1.107로 다운그레이드 시도

지형 정보 수정은 성공
그러나 기본 지형 정보로 설정한 다른 파일들의 경우 globe가 보이지 않는 현상
console.log(viewer.scene.globe) => globe 객체가 생성되기는 하나 프로퍼티가 false

2. 1.103으로 다운그레이드

cesium에서 async/await api 구조 변화를 1.104부터 시작
Cesium.createFrowWorld() 메서드 경우 존재는 하나 기능은 삭제한 것을 보임(다른 파일에서 globe가 보이지 않았던 주요 원인)

부작용? : poc 페이지 경우 성능이 저하된 것으로 보임

---

### 지형 수정 위젯

1. 수정할 면적을 그린다.
2. 면적을 다 그렸을 때 높이를 수정할 수 있는 ui를 제공한다.
3. 높이를 수정하고 입력한 경우 로딩 페이지를 보여주고 줌아웃, 줌인한다.
4. wireframe button을 제공한다.
5. 평탄화된 각각의 지형에 원상복구 기능을 제공한다.
6. 평탄화 지역에 대한 정보를 가지고 있어야 한다.

### 예외 사항

- [] 한 번에 하나의 지형만 수정하게 한다.
- [] 면적과 높이에 제한을 둔다. (tile이 안보이는 현상은 높이에 더 영향을 많아 받는 것 같다.) -500 < 높이 < 500
- [] simple polygon이 아닌 경우 알림을 울린다. -> 정상 작동하긴 함
- [] 깎아진 곳 안에서 줌인 줌아웃 -> 카메라 이동 x, camera.setView 이용?
- [] 같은 위치에 지형 수정

### 기능 목록

- [x] editor 위젯
