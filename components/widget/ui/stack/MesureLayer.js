import {
  areaFormatter,
  formatByKilo,
  formatByMeter,
} from "@/components/module/lib/formatter";
import { useState } from "react";
import { EyeFill, EyeSlashFill, SendFill, Trash } from "react-bootstrap-icons";
import Tooltip from "../../assets/Tooltip";

export default function MeasureLayer({
  data,
  widgetState,
  controller,
  onDelete,
}) {
  const [showState, setShowState] = useState(false);
  const { id, name, value } = data;

  const widgetConfig = {
    distanceWidgetState: {
      description: `거리: ${formatByKilo(value, 4)}`,
    },
    radiusWidgetState: {
      description: `반경: ${formatByMeter(value, 4)}`,
    },
    areaWidgetState: {
      description: `면적: ${areaFormatter(value, 4)}`,
    },
  };

  const { description } = widgetConfig[widgetState.key] || {};

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
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
          <span className="text-sm font-semibold text-gray-600">{name}</span>
          <span className="text-xs text-gray-500">{description}</span>
        </div>
      </div>

      <div className="mr-3 flex items-center">
        <div className="group relative w-max">
          <div
            className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-blue-500"
            onClick={() => {
              controller.zoomToGroup(id);
            }}
          >
            <SendFill className="text-xl" />
          </div>
          <Tooltip contents={"Go To"} />
        </div>
        <div className="group relative w-max">
          <div
            className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-red-600"
            onClick={() => {
              onDelete();
              controller.deleteGroup(id);
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
