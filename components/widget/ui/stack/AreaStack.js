import useDidMountEffect from "@/components/module/useDidMountEffect";
import { areaWidgetState } from "@/recoil/atom/MeasurementState";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import StackForm from "./StackForm";
import { areaFormatter } from "@/components/module/formatter";
import { EyeFill, EyeSlashFill, SendFill, Trash } from "react-bootstrap-icons";
import Tooltip from "../../assets/Tooltip";

export default function AreaStack({ toolController }) {
  const areaWidgetOpen = useRecoilValue(areaWidgetState);
  const [areaData, setAreaData] = useState([]);
  const [layerArray, setLayerArray] = useState([]);

  const handleData = (newData) => {
    setAreaData(newData);
  };

  const handleDeleteLayer = (layerId) => {
    setLayerArray((prevLayers) =>
      prevLayers.filter((layer) => layer.key != layerId),
    );
  };

  useEffect(() => {
    if (!toolController.measure) return;
    const areaController = toolController.measure.areaController;
    areaController.areaStack.readData = handleData;
  }, [toolController]);

  useEffect(() => {
    if (areaWidgetOpen) return;
    setLayerArray([]);
  }, [areaWidgetOpen]);

  useDidMountEffect(() => {
    const newData = areaData[areaData.length - 1];
    if (!newData) return;
    const newLayer = (
      <AreaLayer
        key={newData.id}
        data={newData}
        areaController={toolController.measure.areaController}
        onDelete={() => {
          handleDeleteLayer(newData.id);
        }}
      />
    );
    setLayerArray((prevLayers) => [...prevLayers, newLayer]);
  }, [areaData]);

  return (
    <StackForm
      widgetState={areaWidgetOpen}
      header={"Area List"}
      layerArray={layerArray}
    />
  );
}

function AreaLayer({ data, areaController, onDelete }) {
  const [showState, setShowState] = useState(false);
  const { id, name, value } = data;

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center"
          onClick={() => {
            areaController.toggleShowAreaGroup(id, showState);
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
          <span className="text-xs text-gray-500">{`면적: ${areaFormatter(
            value,
            4,
          )}`}</span>
        </div>
      </div>

      <div className="mr-3 flex items-center">
        <div className="group relative w-max">
          <div
            className="flex h-10 w-8 cursor-pointer items-center justify-center text-slate-500 hover:text-blue-500"
            onClick={() => {
              areaController.zoomToAreaGroup(id);
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
              areaController.deleteAreaGroup(id);
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
