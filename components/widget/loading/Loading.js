import { ClimbingBoxLoader } from "react-spinners";

export default function Loading({ transparent }) {
  const bgClass = transparent ? "bg-transparent" : "bg-black";

  return (
    <div
      className={`pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-50 m-0 flex h-screen w-screen items-center justify-center ${bgClass} p-0`}
    >
      <div className="flex flex-col items-center justify-center gap-10">
        <ClimbingBoxLoader color="#36d7b7" size={25} />

        <h1 className="font-comfortaa pl-8 text-3xl font-semibold text-gray-300">
          Loading...
        </h1>
      </div>
    </div>
  );
}
