import Loading from "./Loading";
import { useEffect } from "react";
import { cloneCameraPosition } from "@/components/handler/cesium/Camera";

export default function TerrainLoading({ viewer, resetModifyState }) {
  const LOADING_DURATION = 600;
  const ZOOMOUT_DISTANCE = 1000000;

  useEffect(() => {
    const { currentCameraPosition, currentCameraOrientation } =
      cloneCameraPosition(viewer);

    viewer.camera.zoomOut(ZOOMOUT_DISTANCE);

    setTimeout(() => {
      viewer.camera.setView({
        destination: currentCameraPosition,
        orientation: currentCameraOrientation,
      });

      resetModifyState();
    }, LOADING_DURATION);
  }, []);

  return <Loading transparent={false} />;
}
