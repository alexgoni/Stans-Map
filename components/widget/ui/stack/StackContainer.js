import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import MeasureStack from "./MeasureStack";

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
    </>
  );
}
