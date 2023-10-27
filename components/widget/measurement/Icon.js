import { useEffect } from "react";
import { XLg } from "react-bootstrap-icons";

// TODO: Widget Open 조건 변경
export default function Icon({ icon, widgetOpen, clickHandler }) {
  return (
    <div
      className={`flex cursor-pointer items-center justify-center rounded-md border-b-4 p-4 shadow-xl ${
        widgetOpen
          ? "border-red-600 bg-red-500 hover:border-red-500 hover:bg-red-400"
          : "border-slate-700 bg-slate-600 hover:border-slate-500  hover:bg-slate-400"
      }`}
      onClick={clickHandler}
    >
      {widgetOpen ? <XLg className="text-2xl text-gray-200" /> : icon}
    </div>
  );
}
