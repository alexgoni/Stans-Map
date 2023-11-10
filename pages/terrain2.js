import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import CustomCesiumTerrainProvider from "@/components/module/CustomCesiumterrainProvider";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { useRecoilValue } from "recoil";
import { tecnoModelState } from "@/recoil/atom/ModelState";
import height from "./height";
import useDidMountEffect from "@/components/module/useDidMountEffect";

export default function Terrain() {
  const tecnoModel = useRecoilValue(tecnoModelState);
  const [height, setHeight] = useState(-100);
  const viewerRef = useRef(null);

  const tecnoPositions = Cesium.Cartesian3.fromDegreesArray([
    127.07049, 37.62457, 127.07049, 37.64457, 127.09049, 37.64457, 127.09049,
    37.62457,
  ]);

  const positions = tecnoPositions;

  useEffect(() => {
    function createWorldTerrain(options) {
      const url = Cesium.IonResource.fromAssetId(1);
      console.log(url);
      const temp = new CustomCesiumTerrainProvider({
        url,
        requestVertexNormals: Cesium.defaultValue(
          options.requestVertexNormals,
          false,
        ),
        requestWaterMask: Cesium.defaultValue(options.requestWaterMask, false),
      });
      console.log(temp);
      return temp;
    }

    const viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: createWorldTerrain({}),
    });

    viewer.extend(Cesium.viewerCesiumInspectorMixin);
    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewerRef.current = viewer;

    const tecno = addModelEntity({
      viewer,
      position: [127.08049, 37.63457, height],
      orientation: [105, 0, 0],
      modelInfo: tecnoModel.info,
    });

    viewer.zoomTo(tecno);

    return () => {
      viewer.destroy();
    };
  }, []);

  useDidMountEffect(() => {
    const viewer = viewerRef.current;
    viewer.terrainProvider.setFloor(positions, height);
    // tecno model position도 같이 움직여야함
  }, [height]);

  return (
    <>
      <div className="fixed left-5 top-5 z-10">
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
      </div>
    </>
  );
}
