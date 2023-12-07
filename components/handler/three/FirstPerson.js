import { useEffect, useRef, useState } from "react";
import useDidMountEffect from "../../module/lib/useDidMountEffect";
import { ArrowClockwise, PlayCircle, Plus } from "react-bootstrap-icons";
import { custom3DButton } from "@/components/widget/assets/Custom3DButton";
import FirstPersonController from "@/components/module/model/FirstPersonController";
import PersonInfo from "@/components/widget/ui/three/PersonInfo";

export default function FirstPerson({ filePath, loadingState }) {
  const [resetCameraPositionFlag, setResetCameraPositionFlag] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [isIntersect, setIsIntersect] = useState(false);
  const { loading, setLoading } = loadingState;
  const controllerRef = useRef(null);

  useEffect(() => {
    const container = document.querySelector("#threeContainer");

    const firstPersonController = new FirstPersonController(
      container,
      filePath,
    );
    firstPersonController.initThree(setLoading, setIsPlay);
    controllerRef.current = firstPersonController;

    return () => {
      firstPersonController.cleanUpThree();
    };
  }, []);

  // Ray Event
  useEffect(() => {
    const firstPersonController = controllerRef.current;
    firstPersonController.turnOnRay(isPlay, setIsIntersect);
  }, [isPlay]);

  // 카메라 위치 초기화
  useDidMountEffect(() => {
    const firstPersonController = controllerRef.current;
    firstPersonController.resetCameraPosition(
      resetCameraPositionFlag,
      setResetCameraPositionFlag,
    );
  }, [resetCameraPositionFlag]);

  return (
    <>
      <div id="threeContainer">
        <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform">
          <PlayCircle
            id="playButton"
            className={`cursor-pointer text-2xl text-slate-200 ${
              loading || isPlay ? "hidden" : ""
            }`}
          />
          <Plus className={`text-xl text-red-600 ${!isPlay ? "hidden" : ""}`} />
        </div>

        {isPlay && isIntersect && <PersonInfo />}
      </div>

      {!loading && (
        <div
          className={`fixed bottom-12 right-12 z-50 h-12 w-14 rounded-full ${custom3DButton}`}
          onClick={() => {
            setResetCameraPositionFlag(true);
          }}
        >
          <ArrowClockwise className="text-2xl text-slate-200" />
        </div>
      )}
    </>
  );
}
