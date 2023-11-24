import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { terrainWidgetState } from "@/recoil/atom/TerrainState";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function Description() {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const areaWidgetOpen = useRecoilValue(areaWidgetState);
  const terrainEditorOpen = useRecoilValue(terrainWidgetState);
  const [text, setText] = useState("");

  const FINISH_BY_RIGHT_CLICK =
    "좌클릭으로 정점을 추가하고 우클릭으로 그리기를 종료하세요.";
  const FINISH_BY_SECOND_CLICK =
    "첫 번째 클릭으로 원을 그리고 두 번째 클릭으로 그리기를 종료하세요.";
  const TERRAIN_DESCRIPTION = "높이를 지정하고 지형을 평탄화할 수 있습니다.";

  useEffect(() => {
    switch (true) {
      case distanceWidgetOpen || areaWidgetOpen:
        setText(FINISH_BY_RIGHT_CLICK);
        break;
      case radiusWidgetOpen:
        setText(FINISH_BY_SECOND_CLICK);
        break;
      case terrainEditorOpen:
        setText(`${FINISH_BY_RIGHT_CLICK}\n${TERRAIN_DESCRIPTION}`);
        break;
      default:
        setText("");
    }
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen, terrainEditorOpen]);

  if (!text) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-8 z-50 -translate-x-1/2 transform rounded-xl bg-black bg-opacity-75 px-3 py-2 text-center">
      <span className="whitespace-pre-wrap text-sm text-gray-100">{text}</span>
    </div>
  );
}
