import { useEffect, useRef, useState } from "react";
import useDidMountEffect from "../../module/lib/useDidMountEffect";
import { ArrowClockwise, PlayCircle, Plus } from "react-bootstrap-icons";
import { custom3DButton } from "@/components/widget/assets/Custom3DButton";
import FirstPersonController from "@/components/module/model/FirstPersonController";

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
        <PlayCircle
          id="playButton"
          className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer text-2xl text-slate-200 ${
            loading || isPlay ? "hidden" : ""
          }`}
        />
        <Plus
          className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform text-xl text-red-600 ${
            !isPlay ? "hidden" : ""
          }`}
        />
        {isPlay && isIntersect && (
          <table className="fixed left-24 top-1/2 z-50 flex -translate-y-1/2 transform flex-col justify-center rounded-md border-2 border-black bg-gray-200 p-2 opacity-70">
            <thead className="flex justify-center">
              <tr>
                <th className="border-b px-4 py-2 text-center">Description</th>
              </tr>
            </thead>
            <tbody className="text-center">
              <tr>
                <td className="border-b px-8 py-2">이름</td>
                <td className="border-b px-8 py-2">천권희</td>
              </tr>
              <tr>
                <td className="border-b px-8 py-2">직책</td>
                <td className="border-b px-8 py-2">인턴</td>
              </tr>
              <tr>
                <td className="border-b px-8 py-2">업무</td>
                <td className="border-b px-8 py-2">프론트엔드 및 GUI</td>
              </tr>
              <tr>
                <td className="border-b px-8 py-2">위치</td>
                <td className="border-b px-8 py-2">413호</td>
              </tr>
            </tbody>
          </table>
        )}
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
