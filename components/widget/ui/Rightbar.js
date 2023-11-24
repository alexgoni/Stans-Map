import { DashLg, PlusLg } from "react-bootstrap-icons";

export default function Rightbar({ viewer }) {
  const ZOOM_AMOUNT = 1000;

  return (
    <div className="fixed right-6 top-1/2 z-40 -translate-y-1/2 transform">
      <div className="flex flex-col gap-2 rounded-lg bg-gray-100 p-1 shadow-2xl">
        <PlusLg
          className="cursor-pointer p-1 text-2xl text-slate-600 hover:text-slate-800"
          onClick={() => {
            viewer.camera.zoomIn(ZOOM_AMOUNT);
          }}
        />
        <DashLg
          className="cursor-pointer p-1 text-2xl text-slate-600 hover:text-slate-800"
          onClick={() => {
            viewer.camera.zoomOut(ZOOM_AMOUNT);
          }}
        />
      </div>
    </div>
  );
}
