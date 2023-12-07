import {
  areaFormatter,
  formatByKilo,
  formatByMeter,
} from "@/components/module/lib/formatter";
import ShowButton from "../../assets/layer_stack/ShowButton";
import {
  LayerData,
  LayerDelete,
  LayerFocus,
} from "../../assets/layer_stack/measure/LayerAssets";

export default function MeasureLayer({
  data,
  widgetState,
  controller,
  onDelete,
}) {
  const { id, name, value } = data;

  const widgetConfig = {
    distanceWidgetState: {
      description: `거리: ${formatByKilo(value, 4)}`,
    },
    radiusWidgetState: {
      description: `반경: ${formatByMeter(value, 4)}`,
    },
    areaWidgetState: {
      description: `면적: ${areaFormatter(value, 4)}`,
    },
  };

  const { description } = widgetConfig[widgetState.key] || {};

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-gray-300 bg-gray-200 shadow-lg">
      <div className="flex items-center gap-2">
        <ShowButton controller={controller} id={id} />
        <LayerData name={name} description={description} />
      </div>

      <div className="mr-3 flex items-center">
        <LayerFocus controller={controller} id={id} />
        <LayerDelete onDelete={onDelete} controller={controller} id={id} />
      </div>
    </div>
  );
}
