import { BoundingBoxCircles, CircleFill, Rulers } from "react-bootstrap-icons";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { useRecoilState, useSetRecoilState } from "recoil";
import { exclusiveToolSelector } from "@/recoil/selector/ToolSelector";
import Icon from "../../assets/Icon";
import Tooltip from "../../assets/Tooltip";

export default function MeasureTool() {
  const [distanceWidgetOpen, setDistanceWidgetOpen] =
    useRecoilState(distanceWidgetState);
  const [radiusWidgetOpen, setRadiusWidgetOpen] =
    useRecoilState(radiusWidgetState);
  const [areaWidgetOpen, setAreaWidgetOpen] = useRecoilState(areaWidgetState);
  const setExclusiveTool = useSetRecoilState(exclusiveToolSelector);

  return (
    <>
      <div className="group relative w-max">
        <Icon
          icon={<Rulers />}
          widgetOpen={distanceWidgetOpen}
          clickHandler={() => {
            if (!distanceWidgetOpen) setExclusiveTool("distance");
            setDistanceWidgetOpen(!distanceWidgetOpen);
          }}
        />
        <Tooltip contents={"Distance"} />
      </div>

      <div className="group relative w-max">
        <Icon
          icon={<CircleFill />}
          widgetOpen={radiusWidgetOpen}
          clickHandler={() => {
            if (!radiusWidgetOpen) setExclusiveTool("radius");
            setRadiusWidgetOpen(!radiusWidgetOpen);
          }}
        />
        <Tooltip contents={"Radius"} />
      </div>

      <div className="group relative w-max">
        <Icon
          icon={<BoundingBoxCircles />}
          widgetOpen={areaWidgetOpen}
          clickHandler={() => {
            if (!areaWidgetOpen) setExclusiveTool("area");
            setAreaWidgetOpen(!areaWidgetOpen);
          }}
        />
        <Tooltip contents={"Area"} />
      </div>
    </>
  );
}
