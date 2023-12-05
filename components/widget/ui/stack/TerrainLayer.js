import { useState } from "react";
import {
  EyeFill,
  EyeSlashFill,
  PencilFill,
  Trash,
} from "react-bootstrap-icons";
import Tooltip from "../../assets/Tooltip";
import { areaFormatter, radiusFormatter } from "@/components/module/formatter";
import {
  currentTerrainLayerId,
  terrainResetButtonClickState,
} from "@/recoil/atom/TerrainState";
import { useRecoilState, useSetRecoilState } from "recoil";

export default function TerrainLayer({ data, controller, onDelete }) {
  const setResetButtonClick = useSetRecoilState(terrainResetButtonClickState);
  const [currentTerrainId, setCurrentTerrainId] = useRecoilState(
    currentTerrainLayerId,
  );
  const [showState, setShowState] = useState(false);
  const [editState, setEditState] = useState(false);
  const { id, name, area, slideHeight, targetHeight } = data;

  return (
    <div className="flex h-24 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center"
          onClick={() => {
            controller.toggleShowGroup(id, showState);
            setShowState(!showState);
          }}
        >
          {showState ? (
            <EyeSlashFill className="text-red-500 hover:text-red-600" />
          ) : (
            <EyeFill className="text-slate-500 hover:text-slate-600" />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <span className="mb-1 text-sm font-semibold text-gray-600">
            {name}
          </span>
          <span className="text-xs text-gray-500">{`면적: ${areaFormatter(
            area,
            4,
          )}`}</span>
          <span className="text-xs text-gray-500">{`평탄화 높이: ${slideHeight}m`}</span>
          <span className="text-xs text-gray-500">{`해발고도: ${radiusFormatter(
            targetHeight,
            4,
          )}`}</span>
        </div>
      </div>

      <div className="mr-3 flex items-center">
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
        <div className="group relative w-max">
          <div
            className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-red-600"
            onClick={() => {
              setResetButtonClick(true);
              onDelete();
              controller.resetModifiedTerrain(id);
            }}
          >
            <Trash className="text-xl" />
          </div>
          <Tooltip contents={"Delete"} />
        </div>
      </div>
    </div>
  );
}
