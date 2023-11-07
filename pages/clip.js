import { defaultCamera } from "@/components/handler/cesium/Camera";
import { addModelEntity } from "@/components/handler/cesium/Entity";
import { Viewer } from "@/components/handler/cesium/Viewer";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { tecnoModelState } from "@/recoil/atom/ModelState";
import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";

export default function Clip() {
  const tecnoModel = useRecoilValue(tecnoModelState);

  useEffect(() => {
    const viewer = Viewer();

    const clippingPlane = new Cesium.ClippingPlane(
      new Cesium.Cartesian3(0.0, 0.0, -1.0),
      15.0,
    );

    const clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: [clippingPlane],
    });

    const cartesianPosition = Cesium.Cartesian3.fromDegrees(
      127.08049,
      37.63457,
      150,
    );

    const cartesianPosition2 = Cesium.Cartesian3.fromDegrees(
      127.08049,
      37.63457,
      160,
    );

    const tecno = viewer.entities.add({
      position: cartesianPosition,
      model: {
        uri: "/glb/tecno.glb",
        scale: 0.01,
        clippingPlanes: clippingPlanes,
      },
    });

    const airplane = viewer.entities.add({
      position: cartesianPosition2,
      model: {
        uri: "/glb/airplane.glb",
        scale: 10,
      },
    });

    viewer.zoomTo(tecno);

    return () => {
      viewer.destroy();
    };
  }, []);

  return <></>;
}
