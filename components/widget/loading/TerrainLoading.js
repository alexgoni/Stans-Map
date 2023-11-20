import Loading from "./Loading";
import { useEffect } from "react";
import { cloneCameraPosition } from "@/components/handler/cesium/Camera";

export default function TerrainLoading({ viewer, resetModifyState }) {
  const LOADING_DURATION = 600;

  useEffect(() => {
    const { currentCameraPosition, currentCameraOrientation } =
      cloneCameraPosition(viewer);

    setTimeout(() => {
      viewer.camera.flyHome(0);
    }, LOADING_DURATION / 2);

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
