import { useEffect, useRef } from "react";
import { EyeSlashFill, Trash, TrashFill } from "react-bootstrap-icons";
import Tooltip from "../../assets/Tooltip";

export default function StackForm({ widgetState, header, layerArray }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [layerArray]);

  return (
    <div
      ref={containerRef}
      className={`scrollbar fixed left-5 top-24 h-1/2 w-72 transform overflow-auto rounded-md border-b-2
    border-gray-300 bg-gray-100 bg-opacity-95 shadow-2xl transition-transform 
    duration-300 ease-in-out ${
      widgetState ? "translate-x-0" : "-translate-x-96"
    }`}
    >
      <div className="sticky top-0 z-10 border-b border-gray-400 bg-gray-100 bg-opacity-95 p-1 indent-1">
        <span className="text-sm text-gray-600">{header}</span>
        {/* <div className="mr-1 mt-1 flex items-center gap-2">
          <div className="group relative w-max">
            <EyeSlashFill className="cursor-pointer text-sm text-red-400" />
            <Tooltip contents={"Hide All"} />
          </div>

          <div className="group relative w-max">
            <TrashFill className="cursor-pointer text-sm text-red-400" />
            <Tooltip contents={"Delete All"} />
          </div>
        </div> */}
      </div>
      {layerArray}
    </div>
  );
}
