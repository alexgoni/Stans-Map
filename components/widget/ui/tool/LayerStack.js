import { useRecoilValue } from "recoil";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { Arrow90degRight, EyeFill } from "react-bootstrap-icons";

const widgets = [
  { state: distanceWidgetState, label: "Distance List" },
  { state: radiusWidgetState, label: "Radius List" },
  { state: areaWidgetState, label: "Area List" },
  { state: terrainWidgetState, label: "Modified Terrain List" },
];

export default function LayerStack() {
  return (
    <>
      {widgets.map((widget, index) => (
        <StackContainer key={index} widget={widget} />
      ))}
    </>
  );
}

function StackContainer({ widget }) {
  const widgetOpen = useRecoilValue(widget.state);

  return (
    <div
      className={`scrollbar fixed left-5 top-24 h-1/2 w-64 transform overflow-auto rounded-md border-b-2
    border-gray-300 bg-gray-100 bg-opacity-95 shadow-2xl transition-transform 
    duration-300 ease-in-out ${
      widgetOpen ? "translate-x-0 " : "-translate-x-96"
    }`}
    >
      <div className="sticky top-0 border-b-[1px] border-gray-400 bg-gray-100 bg-opacity-95 p-1 indent-1">
        <span className="text-sm text-gray-600">{widget.label}</span>
      </div>

      <Layer />
      {/* <Layer />
      <Layer />
      <Layer />
      <Layer />
      <Layer />
      <Layer />
      <Layer /> */}
    </div>
  );
}

function Layer() {
  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 cursor-pointer items-center justify-center text-slate-500 hover:text-slate-600">
          <EyeFill />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold text-gray-600">
            Distance 1
          </span>
          <span className="text-xs text-gray-500">거리: 123m</span>
        </div>
      </div>

      <div className="mr-2 flex h-10 w-10 cursor-pointer items-center justify-center text-slate-500 hover:text-slate-600">
        <Arrow90degRight className="text-xl" />
      </div>
    </div>
  );
}
