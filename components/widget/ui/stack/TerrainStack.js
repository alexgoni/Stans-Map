import useDidMountEffect from "@/components/module/lib/useDidMountEffect";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import StackForm from "../../assets/layer_stack/StackForm";
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

    const existingLayerIndex = layerArray.findIndex(
      (layer) => layer.props.data.id === newData.id,
    );

    if (existingLayerIndex !== -1) {
      // 기존 레이어가 이미 있는 경우 업데이트
      setLayerArray((prevLayers) => {
        const updatedLayers = [...prevLayers];
        updatedLayers[existingLayerIndex] = (
          <TerrainLayer
            key={newData.id}
            data={newData}
            controller={controller}
            onDelete={() => {
              handleDeleteLayer(newData.id);
            }}
          />
        );
        return updatedLayers;
      });
    } else {
      // 기존 레이어가 없는 경우 추가
      setLayerArray((prevLayers) => [
        ...prevLayers,
        <TerrainLayer
          key={newData.id}
          data={newData}
          controller={controller}
          onDelete={() => {
            handleDeleteLayer(newData.id);
          }}
        />,
      ]);
    }
  }, [data]);

  return (
    <StackForm
      widgetState={widgetOpen}
      header={"Terrain Area List"}
      layerArray={layerArray}
    />
  );
}
