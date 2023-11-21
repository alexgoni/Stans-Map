import { useState } from "react";
import { Rulers, Circle, Heptagon } from "react-bootstrap-icons";
import Icon from "../Icon";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { useRecoilState, useSetRecoilState } from "recoil";
import { exclusiveToolSelector } from "@/recoil/selector/ToolSelector";

export default function MeasurementBox() {
  const [boxOpen, setBoxOpen] = useState(false);
  const [distanceWidgetOpen, setDistanceWidgetOpen] =
    useRecoilState(distanceWidgetState);
  const [radiusWidgetOpen, setRadiusWidgetOpen] =
    useRecoilState(radiusWidgetState);
  const [areaWidgetOpen, setAreaWidgetOpen] = useRecoilState(areaWidgetState);

  const setExclusiveTool = useSetRecoilState(exclusiveToolSelector);

  return (
    <>
      <div className="fixed bottom-8 left-10 flex flex-col-reverse gap-1">
        <Icon
          icon={<Rulers className="text-2xl text-gray-200" />}
          widgetOpen={boxOpen}
          clickHandler={() => {
            setBoxOpen(!boxOpen);
            setDistanceWidgetOpen(false);
            setRadiusWidgetOpen(false);
            setAreaWidgetOpen(false);
          }}
        />

        {boxOpen && (
          <>
            <Icon
              icon={<Rulers className="text-2xl text-gray-200" />}
              widgetOpen={distanceWidgetOpen}
              clickHandler={() => {
                if (!distanceWidgetOpen) setExclusiveTool("distance");
                setDistanceWidgetOpen(!distanceWidgetOpen);
              }}
            />
            <Icon
              icon={<Circle className="text-2xl text-gray-200" />}
              widgetOpen={radiusWidgetOpen}
              clickHandler={() => {
                if (!radiusWidgetOpen) setExclusiveTool("radius");
                setRadiusWidgetOpen(!radiusWidgetOpen);
              }}
            />
            <Icon
              icon={<Heptagon className="text-2xl text-gray-200" />}
              widgetOpen={areaWidgetOpen}
              clickHandler={() => {
                if (!areaWidgetOpen) setExclusiveTool("area");
                setAreaWidgetOpen(!areaWidgetOpen);
              }}
            />
          </>
        )}
      </div>
    </>
  );
}
