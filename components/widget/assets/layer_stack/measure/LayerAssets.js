import { SendFill, Trash } from "react-bootstrap-icons";
import Tooltip from "../../Tooltip";

export function LayerData({ name, description }) {
  return (
    <div className="flex flex-col justify-center">
      <span className="text-sm font-semibold text-gray-600">{name}</span>
      <span className="text-xs text-gray-500">{description}</span>
    </div>
  );
}

export function LayerFocus({ controller, id }) {
  return (
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
  );
}

export function LayerDelete({ onDelete, controller, id }) {
  return (
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
  );
}
