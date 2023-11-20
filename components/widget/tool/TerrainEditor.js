import {
  modifyTerrainFlag,
  terrainEditorState,
} from "@/recoil/atom/TerrainState";
import { ArrowDownUp, Globe, GlobeAsiaAustralia } from "react-bootstrap-icons";
import { useRecoilState, useRecoilValue } from "recoil";
import Icon from "../Icon";
import { useState } from "react";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import RangeSlider from "react-bootstrap-range-slider";

export default function TerrainEditWidget({
  viewer,
  setModifyClick,
  setSlideValue,
}) {
  const modifyState = useRecoilValue(modifyTerrainFlag);
  const [editorOpen, setEditorOpen] = useRecoilState(terrainEditorState);
  const [value, setValue] = useState(0);
  const [wireState, setWireState] = useState(false);

  return (
    <>
      <div className="fixed left-10 top-8 flex flex-col gap-1">
        <Icon
          icon={<GlobeAsiaAustralia className="text-2xl text-gray-200" />}
          widgetOpen={editorOpen}
          clickHandler={() => {
            setEditorOpen(!editorOpen);
          }}
        />

        {editorOpen ? (
          <>
            <div className="mt-10">
              <RangeSlider
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onAfterChange={() => setSlideValue(Number(value))}
                min={-500}
                max={500}
                tooltip={"on"}
                tooltipPlacement={"top"}
                tooltipLabel={() => `${value}m`}
              />
            </div>

            <Icon
              icon={<ArrowDownUp className="text-2xl text-gray-200" />}
              widgetOpen={modifyState}
              clickHandler={() => {
                setModifyClick(true);
              }}
            />

            <Icon
              icon={<Globe className="text-2xl text-gray-200" />}
              widgetOpen={wireState}
              clickHandler={() => {
                viewer.scene.globe._surface.tileProvider._debug.wireframe =
                  !wireState;
                setWireState(!wireState);
              }}
            />
          </>
        ) : null}
      </div>
    </>
  );
}
