import { currentTerrainLayerId } from "@/recoil/atom/TerrainState";
import { useState } from "react";
import { PencilFill } from "react-bootstrap-icons";
import { useRecoilState } from "recoil";
import Tooltip from "../../Tooltip";

export default function LayerFocus({ controller, id }) {
  const [editState, setEditState] = useState(false);
  const [currentTerrainId, setCurrentTerrainId] = useRecoilState(
    currentTerrainLayerId,
  );

  return (
    <div className="group relative w-max">
      <div
        className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-blue-500"
        onClick={() => {
          if (!editState) controller.zoomToGroup(id);
          editState ? setCurrentTerrainId(null) : setCurrentTerrainId(id);
          setEditState(!editState);
        }}
      >
        {editState && id === currentTerrainId ? (
          <PencilFill className="text-orange-500 hover:text-orange-600" />
        ) : (
          <PencilFill className="text-slate-500 hover:text-slate-600" />
        )}
      </div>
      <Tooltip contents={"Edit Height"} />
    </div>
  );
}
