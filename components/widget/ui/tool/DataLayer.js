import { useRecoilValue } from "recoil";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";

const widgets = [
  { state: distanceWidgetState, label: "Distance List" },
  { state: radiusWidgetState, label: "Radius List" },
  { state: areaWidgetState, label: "Area List" },
  { state: terrainWidgetState, label: "Modified Terrain List" },
];

export default function DataLayer() {
  return (
    <>
      {widgets.map((widget, index) => (
        <WidgetContainer key={index} widget={widget} />
      ))}
    </>
  );
}

function WidgetContainer({ widget }) {
  const widgetOpen = useRecoilValue(widget.state);

  // TODO: 스크롤바
  return (
    <div
      className={`fixed left-5 top-24 h-1/2 w-72 transform rounded-md border-b-2 
      border-gray-300 bg-gray-100 opacity-95 shadow-2xl transition-transform 
      duration-300 ease-in-out ${
        widgetOpen ? "translate-x-0 " : "-translate-x-96"
      }`}
    >
      <div className="border-b-[1px] border-gray-300 p-1 indent-1">
        <span className="text-sm text-gray-600">{widget.label}</span>
      </div>
    </div>
  );
}
