import useDidMountEffect from "@/components/module/useDidMountEffect";
import { radiusWidgetState } from "@/recoil/atom/MeasurementState";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import StackForm from "./StackForm";
import { EyeFill, EyeSlashFill, SendFill, Trash } from "react-bootstrap-icons";
import Tooltip from "../../assets/Tooltip";
import { radiusFormatter } from "@/components/module/formatter";

export default function RadiusStack({ toolController }) {
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const [radiusData, setRadiusData] = useState([]);
  const [layerArray, setLayerArray] = useState([]);

  const handleData = (newData) => {
    setRadiusData(newData);
  };

  const handleDeleteLayer = (layerId) => {
    setLayerArray((prevLayers) =>
      prevLayers.filter((layer) => layer.key != layerId),
    );
  };

  useEffect(() => {
    if (!toolController.measure) return;
    const circleController = toolController.measure.circleController;
    circleController.circleStack.readData = handleData;
  }, [toolController]);

  useEffect(() => {
    if (radiusWidgetOpen) return;
    setLayerArray([]);
  }, [radiusWidgetOpen]);

  useDidMountEffect(() => {
    const newData = radiusData[radiusData.length - 1];
    if (!newData) return;
    const newLayer = (
      <RadiusLayer
        key={newData.id}
        data={newData}
        circleController={toolController.measure.circleController}
        onDelete={() => {
          handleDeleteLayer(newData.id);
        }}
      />
    );
    setLayerArray((prevLayers) => [...prevLayers, newLayer]);
  }, [radiusData]);

  return (
    <StackForm
      widgetState={radiusWidgetOpen}
      header={"Radius List"}
      layerArray={layerArray}
    />
  );
}

function RadiusLayer({ data, circleController, onDelete }) {
  const [showState, setShowState] = useState(false);
  const { id, name, value } = data;

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center"
          onClick={() => {
            circleController.toggleShowCircleGroup(id, showState);
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
          <span className="text-xs text-gray-500">{`반경: ${radiusFormatter(
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
              circleController.zoomToCircleGroup(id);
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
              circleController.deleteCircleGroup(id);
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
