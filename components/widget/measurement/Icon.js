import { XLg } from "react-bootstrap-icons";

// TODO: Widget Open 조건 변경
export default function Icon({ icon, widgetOpen, onClick }) {
  return (
    <div
      className="flex cursor-pointer items-center justify-center rounded-md border-b-4 border-slate-700 bg-slate-600 p-4 shadow-xl hover:border-slate-500 hover:bg-slate-400"
      onClick={() => {
        onClick ? onClick() : null;
      }}
    >
      {widgetOpen ? <XLg className="text-2xl text-gray-200" /> : icon}
    </div>
  );
}
