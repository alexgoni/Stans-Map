import { List } from "react-bootstrap-icons";
import MeasureTool from "./MeasureTool";
import Description from "../../assets/Description";
import TerrainTool from "./TerrainTool";
import TerrainEditWidget from "./TerrainEditWidget";
import StackContainer from "../stack/StackContainer";
import { CursorHandler } from "@/components/handler/cesium/Viewer";
import BuildTool from "./BuildTool";
import BuildModelWidget from "./BuildModelWidget";

export default function Toolbar({ viewer, toolController }) {
  return (
    <>
      <div className="fixed right-5 top-6 z-50">
        <div className="flex flex-row-reverse gap-4">
          <div className="flex gap-4 rounded-lg border-b-2 border-gray-300 bg-gray-100 p-3 shadow-2xl">
            <List className="cursor-pointer text-2xl text-slate-600 hover:text-slate-800" />
          </div>
          <div className="flex gap-4 rounded-lg border-b-2 border-gray-300 bg-gray-100 p-3 shadow-2xl">
            <TerrainTool />
            <BuildTool />
          </div>
          <div className="flex gap-4 rounded-lg border-b-2 border-gray-300 bg-gray-100 p-3 shadow-2xl">
            <MeasureTool />
          </div>
        </div>
        <TerrainEditWidget viewer={viewer} />
        <BuildModelWidget />
      </div>

      <Description />
      <StackContainer toolController={toolController} />
      <CursorHandler viewer={viewer} />
    </>
  );
}
