import { useRecoilValue } from "recoil";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { EyeFill, SendFill, Trash } from "react-bootstrap-icons";
import Tooltip from "../../assets/Tooltip";
import { useEffect, useRef, useState } from "react";

const widgets = [
  { state: distanceWidgetState, label: "Distance List" },
  { state: radiusWidgetState, label: "Radius List" },
  { state: areaWidgetState, label: "Area List" },
  { state: terrainWidgetState, label: "Modified Terrain List" },
];

export default function LayerStack({ toolData }) {
  return (
    <>
      <DistanceStack toolData={toolData} />
      {/* {widgets.map((widget, index) => (
        <StackContainer key={index} widget={widget} toolData={toolData} />
      ))} */}
    </>
  );
}

function DistanceStack({ toolData }) {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const [layerArray, setLayerArray] = useState([]);
  const [lineGroupArr, setLineGroupArr] = useState([]);

  useEffect(() => {
    if (!toolData.drawerRef) return;
    setLineGroupArr(toolData.drawerRef.lineDrawer.lineGroupArr);
  }, [toolData]);

  useEffect(() => {
    console.log(lineGroupArr);
  }, [lineGroupArr]);

  return (
    <div
      className={`scrollbar fixed left-5 top-24 h-1/2 w-72 transform overflow-auto rounded-md border-b-2
    border-gray-300 bg-gray-100 bg-opacity-95 shadow-2xl transition-transform 
    duration-300 ease-in-out ${
      distanceWidgetOpen ? "translate-x-0 " : "-translate-x-96"
    }`}
    >
      <div className="sticky top-0 z-10 border-b-[1px] border-gray-400 bg-gray-100 bg-opacity-95 p-1 indent-1">
        <span className="text-sm text-gray-600">Distance List</span>
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

// function StackContainer({ widget, toolData }) {
//   const widgetOpen = useRecoilValue(widget.state);
//   const [layerArray, setLayerArray] = useState([]);

//   useEffect(() => {
//     // layerArray 초기화

//     console.log(toolData);
//   }, [toolData]);

//   return (
//     <div
//       className={`scrollbar fixed left-5 top-24 h-1/2 w-64 transform overflow-auto rounded-md border-b-2
//     border-gray-300 bg-gray-100 bg-opacity-95 shadow-2xl transition-transform
//     duration-300 ease-in-out ${
//       widgetOpen ? "translate-x-0 " : "-translate-x-96"
//     }`}
//     >
//       <div className="sticky top-0 border-b-[1px] border-gray-400 bg-gray-100 bg-opacity-95 p-1 indent-1">
//         <span className="text-sm text-gray-600">{widget.label}</span>
//       </div>

//       <Layer />
//       {/* <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer /> */}
//     </div>
//   );
// }

// function StackContainer({ widget, toolData }) {
//   const widgetOpen = useRecoilValue(widget.state);
//   const [layerArray, setLayerArray] = useState([]);

//   useEffect(() => {
//     // layerArray 초기화

//     console.log(toolData);
//   }, [toolData]);

//   return (
//     <div
//       className={`scrollbar fixed left-5 top-24 h-1/2 w-64 transform overflow-auto rounded-md border-b-2
//     border-gray-300 bg-gray-100 bg-opacity-95 shadow-2xl transition-transform
//     duration-300 ease-in-out ${
//       widgetOpen ? "translate-x-0 " : "-translate-x-96"
//     }`}
//     >
//       <div className="sticky top-0 border-b-[1px] border-gray-400 bg-gray-100 bg-opacity-95 p-1 indent-1">
//         <span className="text-sm text-gray-600">{widget.label}</span>
//       </div>

//       <Layer />
//       {/* <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer /> */}
//     </div>
//   );
// }

// function StackContainer({ widget, toolData }) {
//   const widgetOpen = useRecoilValue(widget.state);
//   const [layerArray, setLayerArray] = useState([]);

//   useEffect(() => {
//     // layerArray 초기화

//     console.log(toolData);
//   }, [toolData]);

//   return (
//     <div
//       className={`scrollbar fixed left-5 top-24 h-1/2 w-64 transform overflow-auto rounded-md border-b-2
//     border-gray-300 bg-gray-100 bg-opacity-95 shadow-2xl transition-transform
//     duration-300 ease-in-out ${
//       widgetOpen ? "translate-x-0 " : "-translate-x-96"
//     }`}
//     >
//       <div className="sticky top-0 border-b-[1px] border-gray-400 bg-gray-100 bg-opacity-95 p-1 indent-1">
//         <span className="text-sm text-gray-600">{widget.label}</span>
//       </div>

//       <Layer />
//       {/* <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer />
//       <Layer /> */}
//     </div>
//   );
// }

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

      <div className="mr-3 flex items-center">
        <div className="group relative w-max">
          <div className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-blue-500">
            <SendFill className="text-xl" />
          </div>
          <Tooltip contents={"Go To"} />
        </div>
        <div className="group relative w-max">
          <div className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-red-600">
            <Trash className="text-xl" />
          </div>
          <Tooltip contents={"Delete"} />
        </div>
      </div>
    </div>
  );
}
