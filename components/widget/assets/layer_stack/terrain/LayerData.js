import {
  areaFormatter,
  formatByMeter,
} from "@/components/module/lib/formatter";

export default function LayerData({ data }) {
  const { name, area, slideHeight, targetHeight } = data;

  return (
    <div className="flex flex-col justify-center">
      <span className="mb-1 text-sm font-semibold text-gray-600">{name}</span>
      <span className="text-xs text-gray-500">{`면적: ${areaFormatter(
        area,
        4,
      )}`}</span>
      <span className="text-xs text-gray-500">{`평탄화 높이: ${slideHeight}m`}</span>
      <span className="text-xs text-gray-500">{`해발고도: ${formatByMeter(
        targetHeight,
        4,
      )}`}</span>
    </div>
  );
}
