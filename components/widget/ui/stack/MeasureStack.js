import { useState, useEffect } from "react";
import StackForm from "./StackForm";
import MeasureLayer from "./MesureLayer";
import { useRecoilValue } from "recoil";
import useDidMountEffect from "@/components/module/lib/useDidMountEffect";

export default function MeasureStack({ toolController, widgetState }) {
  const widgetOpen = useRecoilValue(widgetState);
  const [data, setData] = useState([]);
  const [layerArray, setLayerArray] = useState([]);

  const widgetConfig = {
    distanceWidgetState: {
      header: "Distance List",
      moduleType: "line",
    },
    radiusWidgetState: {
      header: "Radius List",
      moduleType: "circle",
    },
    areaWidgetState: {
      header: "Area List",
      moduleType: "area",
    },
  };

  const { header, moduleType } = widgetConfig[widgetState.key] || {};
  const controllerType = moduleType + "Controller";
  const stackType = moduleType + "Stack";

  const handleData = (newData) => {
    setData(newData);
  };

  const handleDeleteLayer = (layerId) => {
    setLayerArray((prevLayers) =>
      prevLayers.filter((layer) => layer.key != layerId),
    );
  };

  useEffect(() => {
    const measureController = toolController.measure;
    if (!measureController) return;

    measureController[controllerType][stackType].readData = handleData;
  }, [toolController]);

  useDidMountEffect(() => {
    const newData = data[data.length - 1];
    if (!newData) return;

    const controller = toolController.measure[controllerType];
    const newLayer = (
      <MeasureLayer
        key={newData.id}
        data={newData}
        widgetState={widgetState}
        controller={controller}
        onDelete={() => {
          handleDeleteLayer(newData.id);
        }}
      />
    );
    setLayerArray((prevLayers) => [...prevLayers, newLayer]);
  }, [data]);

  return (
    <StackForm
      widgetState={widgetOpen}
      header={header}
      layerArray={layerArray}
    />
  );
}
