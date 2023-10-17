import Viewer from "@/components/handler/cesium/Viewer";
import * as Cesium from "cesium";
import { useEffect } from "react";
import * as turf from "@turf/turf";

export default function Test() {
  useEffect(() => {
    const viewer = Viewer({ terrain: Cesium.Terrain.fromWorldTerrain() });

    const polygon = viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray([
          127.08018445000782, 37.635648085178175, 127.07996206247277,
          37.634283243451, 127.08130431103727, 37.63403455517761,
          127.0815599819465, 37.63473264235121, 127.08018445000782,
          37.635648085178175,
        ]),
        material: Cesium.Color.BLUE.withAlpha(0.5),
      },
    });

    const geometry = polygon.polygon.hierarchy.getValue();
    // cartesian3 arr
    const positions = geometry.positions;

    // 폴리곤의 면적을 계산
    // cartographic2 arr
    const coordinates = positions.map((position) => {
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      return [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
      ];
    });

    console.log(coordinates);
    // turf의 polygon 생성
    const polygonFeature = turf.polygon([coordinates]);
    // area 함수를 이용해서 폴리곤 면적 생성
    const area = turf.area(polygonFeature);

    console.log(`폴리곤의 면적: ${area} 제곱미터`);

    viewer.zoomTo(polygon);

    return () => {
      viewer.destroy();
    };
  }, []);

  return <></>;
}
