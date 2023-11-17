import { useSetRecoilState } from "recoil";
import Loading from "./Loading";
import { useEffect } from "react";
import { cloneCameraPosition } from "@/components/handler/cesium/Camera";
import { modifyTerrainFlag } from "@/recoil/atom/TerrainState";

export default function TerrainLoading({ viewer, setIsSelected }) {
  const setModifyState = useSetRecoilState(modifyTerrainFlag);
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

      setModifyState(false);
      setIsSelected(false);
    }, LOADING_DURATION);
  }, []);

  return <Loading transparent={false} />;
}
