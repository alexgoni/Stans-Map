import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { useRecoilValue } from "recoil";
import { tecnoModelState } from "@/recoil/atom/ModelState";
import createCustomTerrainProvider from "@/components/module/CustomTerrainProvider";
import { Viewer } from "@/components/handler/cesium/Viewer";

export default function Terrain() {
  const tecnoModel = useRecoilValue(tecnoModelState);
  const [height, setHeight] = useState(20);

  const viewerRef = useRef(null);

  const positions1 = Cesium.Cartesian3.fromDegreesArray([
    127.178, 37.732, 127.178, 37.736, 127.182, 37.736, 127.182, 37.732,
  ]);

  const positions2 = Cesium.Cartesian3.fromDegreesArray([
    127.183, 37.738, 127.183, 37.742, 127.188, 37.742, 127.188, 37.738,
  ]);

  useEffect(() => {
    let viewer;
    // terrainProvider 설정할 때는 async / await 사용
    (async () => {
      const defaultTerrainProvider =
        await Cesium.CesiumTerrainProvider.fromIonAssetId(1);

      const customTerrainProvider = createCustomTerrainProvider(
        defaultTerrainProvider,
      );

      viewer = Viewer({ terrainProvider: customTerrainProvider });

      viewer.extend(Cesium.viewerCesiumInspectorMixin);
      viewer.scene.globe.depthTestAgainstTerrain = true;

      const elevationDataArray = [
        {
          positions: positions1,
          height,
        },
        {
          positions: positions2,
          height: 500,
        },
      ];

      viewer.terrainProvider.setGlobalFloor(elevationDataArray);

      viewerRef.current = viewer;

      const tecno = addModelEntity({
        viewer,
        position: [127.1805, 37.73458, height],
        orientation: [105, 0, 0],
        modelInfo: tecnoModel.info,
      });

      viewer.zoomTo(tecno);
    })();

    return () => {
      viewerRef.current?.destroy();
    };
  }, []);

  // useDidMountEffect(() => {
  //   const viewer = viewerRef.current;
  //   viewer.terrainProvider.setFloor(positions1, height);
  //   // tecno model position도 같이 움직여야함
  // }, [height]);

  // useEffect(() => {
  //   if (!viewerRef.current) return;
  //   const viewer = viewerRef.current;

  // }, [viewerRef.current]);

  return (
    <>
      {/* <div className="fixed left-5 top-5 z-10">
        <input
          type="range"
          min="0"
          max="500"
          value={height}
          onChange={(e) => {
            setHeight(e.target.value);
          }}
          class="slider"
          id="myRange"
        />
      </div> */}
    </>
  );
}
