import { LayersHalf } from "react-bootstrap-icons";
import Icon from "../../assets/Icon";
import { useRecoilState, useSetRecoilState } from "recoil";
import { exclusiveToolSelector } from "@/recoil/selector/ToolSelector";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import Tooltip from "../../assets/Tooltip";

export default function TerrainTool() {
  const [terrainWidgetOpen, setTerrainWidgetOpen] =
    useRecoilState(terrainWidgetState);
  const setExclusiveTool = useSetRecoilState(exclusiveToolSelector);

  return (
    <>
      <div className="group relative w-max">
        <Icon
          icon={<LayersHalf />}
          widgetOpen={terrainWidgetOpen}
          clickHandler={() => {
            if (!terrainWidgetOpen) setExclusiveTool("terrain");
            setTerrainWidgetOpen(!terrainWidgetOpen);
          }}
        />
        <Tooltip contents={"Flatten the Terrain"} />
      </div>
    </>
  );
}
