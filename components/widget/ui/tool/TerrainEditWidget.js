import {
  currentTerrainLayerId,
  modifyButtonClickState,
  targetHeightValue,
  terrainWidgetState,
} from "@/recoil/atom/TerrainState";
import { useEffect, useState } from "react";
import { ArrowDownUp, Globe2 } from "react-bootstrap-icons";
import RangeSlider from "react-bootstrap-range-slider";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Tooltip from "../../assets/Tooltip";
import { custom3DButton } from "../../assets/Custom3DButton";

export default function TerrainEditWidget({ viewer }) {
  const terrainWidgetOpen = useRecoilValue(terrainWidgetState);
  const setTargetHeight = useSetRecoilState(targetHeightValue);
  const setModifyButtonClick = useSetRecoilState(modifyButtonClickState);
  const editTerrainOn = useRecoilValue(currentTerrainLayerId);
  const [slideValue, setSlideValue] = useState(0);
  const [wireView, setWireView] = useState(false);

  useEffect(() => {
    viewer.scene.globe._surface.tileProvider._debug.wireframe = wireView;
  }, [wireView]);

  return (
    <>
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          terrainWidgetOpen ? "translate-x-0" : "translate-x-80"
        }`}
      >
        <div className="absolute right-0 z-50 float-right mt-6 inline-block rounded-lg border-b-2 border-gray-300 bg-gray-100 p-2 shadow-2xl">
          <span
            className={`relative left-1 top-1 h-3 w-3 ${
              editTerrainOn ? "flex" : "hidden"
            }`}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500"></span>
          </span>

          <div className="flex items-center gap-2">
            <span className="w-10 select-none text-center text-sm font-medium">
              높이
            </span>
            <RangeSlider
              value={slideValue}
              onChange={(e) => setSlideValue(e.target.value)}
              onAfterChange={() => setTargetHeight(Number(slideValue))}
              min={-500}
              max={500}
              tooltip={"auto"}
              tooltipPlacement={"top"}
              tooltipLabel={() => `${slideValue}m`}
            />
            <span className="w-12 select-none text-center">{`${slideValue}m`}</span>
          </div>

          <div className="my-1 flex items-center">
            <div className="group relative mx-2 w-max flex-1 cursor-pointer pt-1">
              <div
                className={`flex items-center justify-center rounded-lg border-b-2 border-slate-800 py-2 ${
                  wireView
                    ? "bg-black hover:bg-gray-900"
                    : "bg-slate-600 hover:bg-slate-700"
                }`}
                onClick={() => setWireView(!wireView)}
              >
                <div
                  className={`text-xl ${
                    wireView ? "text-teal-400" : "text-white"
                  }`}
                >
                  <Globe2 />
                </div>
                <Tooltip contents={"View by Wire"} />
              </div>
            </div>

            <div className="group relative mx-2 w-max flex-1">
              <div
                className={`-mt-2 flex h-8 rounded-lg ${custom3DButton}`}
                onClick={() => {
                  setModifyButtonClick(true);
                }}
              >
                <ArrowDownUp className="text-lg text-slate-200" />
              </div>
              <Tooltip contents={"Modify the Terrain"} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
