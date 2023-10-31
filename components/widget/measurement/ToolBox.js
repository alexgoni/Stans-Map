import { useEffect, useState } from "react";
import { Rulers, Circle, Heptagon } from "react-bootstrap-icons";
import Icon from "./Icon";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import { useRecoilState } from "recoil";

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
          widgetOpen={toolBoxOpen}
          clickHandler={() => {
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
              widgetOpen={distanceWidgetOpen}
              clickHandler={() => {
                setDistanceWidgetOpen(!distanceWidgetOpen);
                if (!distanceWidgetOpen) {
                  setRadiusWidgetOpen(false);
                  setAreaWidgetOpen(false);
                }
              }}
            />
            <Icon
              icon={<Circle className="text-2xl text-gray-200" />}
              widgetOpen={radiusWidgetOpen}
              clickHandler={() => {
                setRadiusWidgetOpen(!radiusWidgetOpen);
                if (!radiusWidgetOpen) {
                  setDistanceWidgetOpen(false);
                  setAreaWidgetOpen(false);
                }
              }}
            />
            <Icon
              icon={<Heptagon className="text-2xl text-gray-200" />}
              widgetOpen={areaWidgetOpen}
              clickHandler={() => {
                setAreaWidgetOpen(!areaWidgetOpen);
                if (!areaWidgetOpen) {
                  setDistanceWidgetOpen(false);
                  setRadiusWidgetOpen(false);
                }
              }}
            />
          </>
        ) : null}
      </div>
    </>
  );
}
