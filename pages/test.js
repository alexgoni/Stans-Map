import Viewer from "@/components/handler/cesium/Viewer";
import * as Cesium from "cesium";
import { useEffect } from "react";
import area from "@turf/area"; // turf 라이브러리에서 area 함수만 가져옵니다.

export default function Test() {
  useEffect(() => {
    const viewer = Viewer({ terrain: Cesium.Terrain.fromWorldTerrain() });

    const polygon = viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          127.08018445000782, 37.635648085178175, 127.07996206247277,
          37.634283243451, 127.08130431103727, 37.63403455517761,
          127.0815599819465, 37.63473264235121,
        ]),
        material: Cesium.Color.BLUE.withAlpha(0.5),
      },
    });

    const geometry = polygon.polygon.hierarchy.getValue();
    const positions = geometry.positions;

    // 폴리곤의 면적을 계산
    const coordinates = positions.map((position) => {
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      return [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
      ];
    });

    const areaResult = area({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    });

    console.log(`폴리곤의 면적: ${areaResult} 제곱미터`);

    viewer.zoomTo(polygon);

    return () => {
      viewer.destroy();
    };
  }, []);

  return <></>;
}
