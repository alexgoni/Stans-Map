import { Globe2 } from "react-bootstrap-icons";
import Tooltip from "../Tooltip";
import { useEffect, useState } from "react";

export default function WireButton({ viewer }) {
  const [wireView, setWireView] = useState(false);

  useEffect(() => {
    viewer.scene.globe._surface.tileProvider._debug.wireframe = wireView;
  }, [wireView]);

  return (
    <div className="group relative mx-2 w-max flex-1 cursor-pointer pt-1">
      <div
        className={`flex items-center justify-center rounded-lg border-b-2 border-slate-800 py-2 ${
          wireView
            ? "bg-black hover:bg-gray-900"
            : "bg-slate-600 hover:bg-slate-700"
        }`}
        onClick={() => setWireView(!wireView)}
      >
        <div className={`text-xl ${wireView ? "text-teal-400" : "text-white"}`}>
          <Globe2 />
        </div>
        <Tooltip contents={"View by Wire"} />
      </div>
    </div>
  );
}
