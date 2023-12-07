import { ArrowDownUp } from "react-bootstrap-icons";
import Tooltip from "../Tooltip";
import { custom3DButton } from "../Custom3DButton";
import { useSetRecoilState } from "recoil";
import { modifyButtonClickState } from "@/recoil/atom/TerrainState";

export default function ModifyButton() {
  const setModifyButtonClick = useSetRecoilState(modifyButtonClickState);

  return (
    <div className="group relative mx-2 w-max flex-1">
      <div
        className={`-mt-2 flex h-8 rounded-lg ${custom3DButton}`}
        onClick={() => {
          setModifyButtonClick(true);
        }}
      >
        <ArrowDownUp className="text-lg text-slate-200" />
      </div>
      <Tooltip contents={"Modify the Terrain"} />
    </div>
  );
}
