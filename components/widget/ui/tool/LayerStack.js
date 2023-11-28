import { useRecoilValue } from "recoil";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { EyeFill, EyeSlashFill, SendFill, Trash } from "react-bootstrap-icons";
import Tooltip from "../../assets/Tooltip";
import { useEffect, useRef, useState } from "react";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { detailDistanceFormatter } from "@/components/module/formatter";

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
  const [distanceData, setDistanceData] = useState([]);
  const [layerArray, setLayerArray] = useState([]);

  const handleDeleteLayer = (layerId) => {
    setLayerArray((prevLayers) =>
      prevLayers.filter((layer) => layer.key !== layerId),
    );
  };

  const handleData = (newData) => {
    setDistanceData(newData);
  };

  useEffect(() => {
    if (!toolData.drawerRef) return;
    toolData.drawerRef.lineDrawer.readData = handleData;
  }, [toolData]);

  useEffect(() => {
    if (distanceWidgetOpen) return;
    setLayerArray([]);
  }, [distanceWidgetOpen]);

  useDidMountEffect(() => {
    const index = distanceData.length - 1;
    const newData = distanceData[index];
    const newLayer = (
      <Layer
        key={newData.id}
        data={newData}
        lineDrawer={toolData.drawerRef.lineDrawer}
      />
    );
    setLayerArray((prevLayers) => [...prevLayers, newLayer]);
  }, [distanceData]);

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
      {layerArray.map((layer) => (
        <Layer
          key={layer.key}
          data={layer.props.data}
          lineDrawer={toolData.drawerRef.lineDrawer}
          onDelete={() => handleDeleteLayer(layer.key)}
        />
      ))}
    </div>
  );
}

function Layer({ data, lineDrawer, onDelete }) {
  const [showState, setShowState] = useState(false);
  const { id, name, value } = data;

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center"
          onClick={() => {
            lineDrawer.toggleShowLineGroup(id, showState);
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
          <span className="text-xs text-gray-500">{`거리: ${detailDistanceFormatter(
            value,
          )}`}</span>
        </div>
      </div>

      <div className="mr-3 flex items-center">
        <div className="group relative w-max">
          <div
            className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-blue-500"
            onClick={() => {
              lineDrawer.zoomToLineGroup(id);
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
              lineDrawer.deleteLineGroup(id);
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
