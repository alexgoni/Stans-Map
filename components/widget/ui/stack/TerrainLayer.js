import ShowButton from "../../assets/layer_stack/ShowButton";
import LayerData from "../../assets/layer_stack/terrain/LayerData";
import LayerFocus from "../../assets/layer_stack/terrain/LayerFocus";
import LayerDelete from "../../assets/layer_stack/terrain/LayerDelete";

export default function TerrainLayer({ data, controller, onDelete }) {
  const { id } = data;

  return (
    <div className="flex h-24 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <ShowButton controller={controller} id={id} />
        <LayerData data={data} />
      </div>

      <div className="mr-3 flex items-center">
        <LayerFocus controller={controller} id={id} />
        <LayerDelete onDelete={onDelete} controller={controller} id={id} />
      </div>
    </div>
  );
}
