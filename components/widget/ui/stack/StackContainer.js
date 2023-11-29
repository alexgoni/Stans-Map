import DistanceStack from "./DistanceStack";
import RadiusStack from "./RadiusStack";

export default function StackContainer({ toolController }) {
  return (
    <>
      <DistanceStack toolController={toolController} />
      <RadiusStack toolController={toolController} />
    </>
  );
}
