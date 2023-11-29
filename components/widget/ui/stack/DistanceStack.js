import { useRecoilValue } from "recoil";
import { distanceWidgetState } from "@/recoil/atom/MeasurementState";
import { EyeFill, EyeSlashFill, SendFill, Trash } from "react-bootstrap-icons";
import Tooltip from "../../assets/Tooltip";
import { useEffect, useState } from "react";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { detailDistanceFormatter } from "@/components/module/formatter";
import StackForm from "./StackForm";

export default function DistanceStack({ toolData }) {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const [distanceData, setDistanceData] = useState([]);
  const [layerArray, setLayerArray] = useState([]);

  const handleData = (newData) => {
    setDistanceData(newData);
  };

  const handleDeleteLayer = (layerId) => {
    setLayerArray((prevLayers) =>
      prevLayers.filter((layer) => layer.key != layerId),
    );
  };

  useEffect(() => {
    if (!toolData.measureRef) return;
    toolData.measureRef.lineController.lineStack.readData = handleData;
  }, [toolData, distanceWidgetOpen]);

  useEffect(() => {
    if (distanceWidgetOpen) return;
    setLayerArray([]);
  }, [distanceWidgetOpen]);

  useDidMountEffect(() => {
    const newData = distanceData[distanceData.length - 1];
    const newLayer = (
      <DistanceLayer
        key={newData.id}
        data={newData}
        lineController={toolData.measureRef.lineController}
        onDelete={() => {
          handleDeleteLayer(newData.id);
        }}
      />
    );
    setLayerArray((prevLayers) => [...prevLayers, newLayer]);
  }, [distanceData]);

  return (
    <StackForm
      widgetState={distanceWidgetOpen}
      header={"Distance List"}
      layerArray={layerArray}
    />
  );
}

function DistanceLayer({ data, lineController, onDelete }) {
  const [showState, setShowState] = useState(false);
  const { id, name, value } = data;

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center"
          onClick={() => {
            lineController.toggleShowLineGroup(id, showState);
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
              lineController.zoomToLineGroup(id);
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
              lineController.deleteLineGroup(id);
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
