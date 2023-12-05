import {
  buildKhalifaModelState,
  buildOfficeModelState,
  buildTechnoModelState,
  buildWidgetState,
} from "@/recoil/atom/BuildState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import BuildingImage from "../stack/BuildingImage";
import { buildingModelOnOffSelector } from "@/recoil/selector/BuildSelector";

export default function BuildModelWidget() {
  const buildWidgetOpen = useRecoilValue(buildWidgetState);
  const setBuildingModelOn = useSetRecoilState(buildingModelOnOffSelector);

  return (
    <>
      <div
        className={`transform transition-transform duration-300 ease-in-out ${
          buildWidgetOpen ? "translate-x-0" : "translate-x-80"
        }`}
      >
        <div className="absolute right-0 z-50 float-right mt-6 rounded-lg border-b-2 border-gray-300 bg-gray-100 shadow-2xl">
          <div className="border-b border-gray-400 p-1 indent-1 text-sm text-gray-600">
            Models
          </div>
          <div className="mt-1 flex gap-4 p-2">
            <BuildingImage
              src={"/img/techno.jpg"}
              text={"Techno Park"}
              buildModelState={buildTechnoModelState}
              setBuildingModelOn={() => {
                setBuildingModelOn("techno");
              }}
            />

            <BuildingImage
              src={"/img/office.png"}
              text={"Office"}
              buildModelState={buildOfficeModelState}
              setBuildingModelOn={() => {
                setBuildingModelOn("office");
              }}
            />

            <BuildingImage
              src={"/img/burj_khalifa.jpg"}
              text={"Burj Khalifa"}
              buildModelState={buildKhalifaModelState}
              setBuildingModelOn={() => {
                setBuildingModelOn("khalifa");
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
