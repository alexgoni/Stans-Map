import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { useRecoilValue } from "recoil";
import { tecnoModelState } from "@/recoil/atom/ModelState";
import createCustomTerrainProvider from "@/components/module/CustomTerrainProvider";
import { Viewer } from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import Loading from "@/components/widget/loading/Loading";

export default function Terrain() {
  const tecnoModel = useRecoilValue(tecnoModelState);
  const [slideValue, setSlideValue] = useState(20);
  const [height, setHeight] = useState(slideValue);
  const [loading, setLoading] = useState(false);
  const viewerRef = useRef(null);
  const customRef = useRef(null);

  const positions1 = Cesium.Cartesian3.fromDegreesArray([
    127.178, 37.732, 127.178, 37.736, 127.182, 37.736, 127.182, 37.732,
  ]);

  const positions2 = Cesium.Cartesian3.fromDegreesArray([
    127.183, 37.738, 127.183, 37.742, 127.188, 37.742, 127.188, 37.738,
  ]);

  const elevationDataArray = [
    {
      positions: positions1,
      height,
    },
    // {
    //   positions: positions2,
    //   height: 500,
    // },
  ];

  useEffect(() => {
    // terrainProvider 설정할 때는 async / await 사용
    (async () => {
      const defaultTerrainProvider =
        await Cesium.CesiumTerrainProvider.fromIonAssetId(1);
      const customTerrainProvider = createCustomTerrainProvider(
        defaultTerrainProvider,
      );
      customRef.current = customTerrainProvider;

      const viewer = Viewer({ terrainProvider: customTerrainProvider });
      viewer.extend(Cesium.viewerCesiumInspectorMixin);
      viewer.scene.globe.depthTestAgainstTerrain = true;
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
      viewerRef.current = null;
    };
  }, []);

  useDidMountEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    setLoading(true);
    viewer.terrainProvider.setGlobalFloor(elevationDataArray);

    const currentCameraPosition = viewer.camera.position.clone();
    const currentCameraHeading = viewer.camera.heading;
    const currentCameraPitch = viewer.camera.pitch;
    const currentCameraRoll = viewer.camera.roll;

    setTimeout(() => {
      viewer.camera.flyHome(0);
    }, 300);

    setTimeout(() => {
      viewer.camera.setView({
        destination: currentCameraPosition,
        orientation: {
          heading: currentCameraHeading,
          pitch: currentCameraPitch,
          roll: currentCameraRoll,
        },
      });
      setLoading(false);
    }, 600);
  }, [height]);

  return (
    <>
      {loading ? <Loading transparent={false} /> : null}

      <div className="fixed left-5 top-5 z-10">
        <input
          type="range"
          min="0"
          max="500"
          value={slideValue}
          onChange={(e) => setSlideValue(e.target.value)}
          onMouseUp={(e) => {
            setHeight(Number(slideValue));
          }}
        />
      </div>
    </>
  );
}
