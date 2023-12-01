import useDidMountEffect from "@/components/module/useDidMountEffect";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import StackForm from "./StackForm";
import TerrainLayer from "./TerrainLayer";

export default function TerrainStack({ toolController }) {
  const widgetOpen = useRecoilValue(terrainWidgetState);
  const [data, setData] = useState([]);
  const [layerArray, setLayerArray] = useState([]);

  const handleData = (newData) => {
    setData(newData);
  };

  const handleDeleteLayer = (layerId) => {
    setLayerArray((prevLayers) =>
      prevLayers.filter((layer) => layer.key != layerId),
    );
  };

  useEffect(() => {
    const terrainController = toolController.terrain;
    if (!terrainController) return;

    terrainController.terrainStack.readData = handleData;
  }, [toolController]);

  useDidMountEffect(() => {
    const newData = data[data.length - 1];
    if (!newData) return;

    const controller = toolController.terrain;
    const newLayer = (
      <TerrainLayer
        key={newData.id}
        data={newData}
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
      header={"Terrain Area List"}
      layerArray={layerArray}
    />
  );
}
