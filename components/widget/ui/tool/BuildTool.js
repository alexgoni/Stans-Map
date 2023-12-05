import { BuildingAdd } from "react-bootstrap-icons";
import Icon from "../../assets/Icon";
import Tooltip from "../../assets/Tooltip";
import { buildWidgetState } from "@/recoil/atom/BuildState";
import { useRecoilState, useSetRecoilState } from "recoil";
import { exclusiveToolSelector } from "@/recoil/selector/ToolSelector";
import { buildingModelOnOffSelector } from "@/recoil/selector/BuildSelector";

export default function BuildTool() {
  const [buildWidgetOpen, setBuildWidgetOpen] =
    useRecoilState(buildWidgetState);
  const setExclusiveTool = useSetRecoilState(exclusiveToolSelector);
  const setBuildingModelOn = useSetRecoilState(buildingModelOnOffSelector);

  return (
    <>
      <div className="group relative w-max">
        <Icon
          icon={<BuildingAdd />}
          widgetOpen={buildWidgetOpen}
          clickHandler={() => {
            buildWidgetOpen
              ? setBuildingModelOn("toolOff")
              : setExclusiveTool("build");
            setBuildWidgetOpen(!buildWidgetOpen);
          }}
        />
        <Tooltip contents={"Add Building"} />
      </div>
    </>
  );
}
