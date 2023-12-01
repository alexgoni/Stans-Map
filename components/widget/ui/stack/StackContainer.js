import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import MeasureStack from "./MeasureStack";
import TerrainStack from "./TerrainStack";

export default function StackContainer({ toolController }) {
  return (
    <>
      <MeasureStack
        toolController={toolController}
        widgetState={distanceWidgetState}
      />
      <MeasureStack
        toolController={toolController}
        widgetState={radiusWidgetState}
      />
      <MeasureStack
        toolController={toolController}
        widgetState={areaWidgetState}
      />
      <TerrainStack toolController={toolController} />
    </>
  );
}
