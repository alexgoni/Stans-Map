import { targetHeightValue } from "@/recoil/atom/TerrainState";
import { useState } from "react";
import RangeSlider from "react-bootstrap-range-slider";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import { useSetRecoilState } from "recoil";

export default function HeightSlider() {
  const setTargetHeight = useSetRecoilState(targetHeightValue);
  const [slideValue, setSlideValue] = useState(0);

  return (
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
  );
}
