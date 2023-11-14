import { terrainEditorState } from "@/recoil/atom/MeasurementState";
import { GlobeAsiaAustralia } from "react-bootstrap-icons";
import { useRecoilState } from "recoil";
import Icon from "../Icon";

export default function TerrainEditor() {
  const [editorOpen, setEditorOpen] = useRecoilState(terrainEditorState);

  return (
    <>
      <div className="fixed left-10 top-8 ">
        <Icon
          icon={<GlobeAsiaAustralia className="text-2xl text-gray-200" />}
          widgetOpen={editorOpen}
          clickHandler={() => {
            setEditorOpen(!editorOpen);
          }}
        />
      </div>
    </>
  );
}
