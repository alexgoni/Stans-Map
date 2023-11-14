import { Viewer } from "@/components/handler/cesium/Viewer";
import TerrainEditor from "@/components/widget/tool/TerrainEditor";
import React, { useEffect } from "react";

export default function Terrain() {
  useEffect(() => {
    const viewer = Viewer();
    return () => {
      viewer.destroy();
    };
  }, []);

  return (
    <>
      <TerrainEditor />
    </>
  );
}
