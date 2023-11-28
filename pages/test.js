import { Viewer } from "@/components/handler/cesium/Viewer";
import LineDrawer from "@/components/module/tool/measurement/Line";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { useEffect, useRef, useState } from "react";

export default function Test() {
  const [data, setData] = useState([]);
  const [drawLine, setDrawLine] = useState(false);
  const lineDrawerRef = useRef(null);

  const handleDataChange = (newData) => {
    setData(newData);
  };

  useEffect(() => {
    const viewer = Viewer();

    const lineDrawer = new LineDrawer(viewer, handleDataChange);
    lineDrawerRef.current = lineDrawer;

    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  useDidMountEffect(() => {
    const lineDrawer = lineDrawerRef.current;

    if (drawLine) {
      lineDrawer.startDrawing();
    } else {
      lineDrawer.stopDrawing();
      lineDrawer.clearLineGroupArr();
    }

    return () => {
      lineDrawer.stopDrawing();
    };
  }, [drawLine]);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 bg-white p-4"
        onClick={() => {
          setDrawLine(true);
        }}
      >
        Start Drawing line
      </button>
      <button
        className="fixed left-4 top-16 z-50 bg-white p-4"
        onClick={() => {
          setDrawLine(false);
        }}
      >
        Clear Entities
      </button>
    </>
  );
}
