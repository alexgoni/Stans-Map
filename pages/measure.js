import { defaultCamera } from "@/components/handler/cesium/Camera";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import Viewer from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { MeasureWidget, pointEvent } from "@/components/widget/Measure";
import { tecnoModelState } from "@/recoil/atom/ModelState";
import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

export default function Measure() {
  const viewerRef = useRef(null);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [surfaceDistance, setSurfaceDistance] = useState(0);
  const tecnoModel = useRecoilValue(tecnoModelState);

  useEffect(() => {
    const geomap = new Cesium.WebMapServiceImageryProvider({
      url: "http://192.168.1.45:8188/geoserver/wms",
      parameters: {
        format: "image/png",
        transparent: "true",
        tiled: true,
        enablePickFeatures: true,
      },
      layers: "stans:protoMap",
      maximumLevel: 20,
    });

    // viewer 생성
    const viewer = Viewer({
      img: geomap,
      animation: false,
      baseLayerPicker: false,
      terrain: Cesium.Terrain.fromWorldTerrain(),
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

    viewerRef.current = viewer;

    // Camera 설정
    defaultCamera(viewer, [127.08049, 37.63457, 500]);

    // tecno 생성
    const tecno = addModelEntity({
      viewer,
      position: tecnoModel.position,
      orientation: tecnoModel.orientation,
      modelInfo: tecnoModel.info,
    });

    viewer.zoomTo(tecno);

    return () => {
      viewer.destroy();
    };
  }, []);

  // Measure
  useDidMountEffect(() => {
    const viewer = viewerRef.current;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    pointEvent({ viewer, handler, widgetOpen, setSurfaceDistance });

    return () => {
      handler.destroy();
      cesiumContainer.style.cursor = "default";
    };
  }, [widgetOpen]);

  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      <MeasureWidget
        widgetOpen={widgetOpen}
        setWidgetOpen={setWidgetOpen}
        surfaceDistance={surfaceDistance}
      />
    </>
  );
}
