import { useState } from "react";
import { Rulers, Circle, Heptagon } from "react-bootstrap-icons";
import Icon from "./Icon";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { useRecoilState } from "recoil";

// TODO: 세가지 이벤트 겹칠때? : 다른 위젯 x로 전환? cursor Pointer?
export default function ToolBox() {
  const [toolBoxOpen, setToolBoxOpen] = useState(false);
  const [distanceWidgetOpen, setDistanceWidgetOpen] =
    useRecoilState(distanceWidgetState);
  const [radiusWidgetOpen, setRadiusWidgetOpen] =
    useRecoilState(radiusWidgetState);
  const [areaWidgetOpen, setAreaWidgetOpen] = useRecoilState(areaWidgetState);

  return (
    <>
      <div className="fixed bottom-8 left-10 flex flex-col-reverse gap-1">
        <Icon
          icon={<Rulers className="text-2xl text-gray-200" />}
          onClick={() => {
            setToolBoxOpen(!toolBoxOpen);
            setDistanceWidgetOpen(false);
            setRadiusWidgetOpen(false);
            setAreaWidgetOpen(false);
          }}
        />

        {toolBoxOpen ? (
          <>
            <Icon
              icon={<Rulers className="text-2xl text-gray-200" />}
              onClick={() => setDistanceWidgetOpen(!distanceWidgetOpen)}
            />
            <Icon
              icon={<Circle className="text-2xl text-gray-200" />}
              onClick={() => setRadiusWidgetOpen(!radiusWidgetOpen)}
            />
            <Icon
              icon={<Heptagon className="text-2xl text-gray-200" />}
              onClick={() => setAreaWidgetOpen(!areaWidgetOpen)}
            />
          </>
        ) : null}
      </div>
    </>
  );
}
