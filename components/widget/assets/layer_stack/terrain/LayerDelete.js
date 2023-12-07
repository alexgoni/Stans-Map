import { Trash } from "react-bootstrap-icons";
import Tooltip from "../../Tooltip";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  currentTerrainLayerId,
  terrainResetButtonClickState,
} from "@/recoil/atom/TerrainState";

export default function LayerDelete({ onDelete, controller, id }) {
  const setResetButtonClick = useSetRecoilState(terrainResetButtonClickState);
  const [currentTerrainId, setCurrentTerrainId] = useRecoilState(
    currentTerrainLayerId,
  );

  return (
    <div className="group relative w-max">
      <div
        className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-red-600"
        onClick={() => {
          onDelete();
          setResetButtonClick(true);
          controller.resetModifiedTerrain(id);
          if (id === currentTerrainId) setCurrentTerrainId(null);
        }}
      >
        <Trash className="text-xl" />
      </div>
      <Tooltip contents={"Delete"} />
    </div>
  );
}
