import {
  currentTerrainLayerId,
  terrainWidgetState,
} from "@/recoil/atom/TerrainState";
import { useRecoilValue } from "recoil";
import EditAlert from "../../assets/terrain_edit/EditAlert";
import WireButton from "../../assets/terrain_edit/WireButton";
import HeightSlider from "../../assets/terrain_edit/HeightSlider";
import ModifyButton from "../../assets/terrain_edit/ModifyButton";

export default function TerrainEditWidget({ viewer }) {
  const terrainWidgetOpen = useRecoilValue(terrainWidgetState);
  const editTerrainOn = useRecoilValue(currentTerrainLayerId);

  return (
    <>
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          terrainWidgetOpen ? "translate-x-0" : "translate-x-80"
        }`}
      >
        <div className="absolute right-0 z-50 float-right mt-6 inline-block rounded-lg border-b-2 border-gray-300 bg-gray-100 p-2 shadow-2xl">
          <EditAlert editTerrainOn={editTerrainOn} />
          <HeightSlider />

          <div className="my-1 flex items-center">
            <WireButton viewer={viewer} />
            <ModifyButton />
          </div>
        </div>
      </div>
    </>
  );
}
