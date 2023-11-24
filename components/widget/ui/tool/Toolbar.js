import { List } from "react-bootstrap-icons";
import MeasureTool from "./MeasureTool";
import Description from "../../assets/Description";
import TerrainTool from "./TerrainTool";
import TerrainEditWidget from "./TerrainEditWidget";
import LayerStack from "./LayerStack";

export default function Toolbar({ viewer }) {
  return (
    <>
      <div className="fixed right-5 top-6 z-50">
        <div className="flex flex-row-reverse gap-4">
          <div className="flex gap-4 rounded-lg border-b-2 border-gray-300 bg-gray-100 p-3 shadow-2xl">
            <List className="cursor-pointer text-2xl text-slate-600 hover:text-slate-800" />
          </div>
          <div className="flex gap-4 rounded-lg border-b-2 border-gray-300 bg-gray-100 p-3 shadow-2xl">
            <MeasureTool />
            <div className="border-l border-gray-500" />
            <TerrainTool />
          </div>
        </div>
        <TerrainEditWidget viewer={viewer} />
      </div>

      <LayerStack />
      <Description />
    </>
  );
}
