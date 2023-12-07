import Image from "next/image";
import { useRecoilState } from "recoil";

export default function BuildingImage({
  src,
  text,
  buildModelState,
  setBuildingModelOn,
}) {
  const [buildModel, setBuildModelState] = useRecoilState(buildModelState);

  return (
    <div
      className={`flex cursor-pointer flex-col items-center rounded-md border-2 p-1 ${
        buildModel ? "border-blue-500" : "border-gray-400"
      }`}
      onClick={() => {
        setBuildModelState(!buildModel);
        setBuildingModelOn();
      }}
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-lg">
        <Image
          className="object-cover"
          src={src}
          alt="Building Image"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <span
        className={`text-xs ${buildModel ? "text-blue-500" : "text-gray-500"}`}
      >
        {text}
      </span>
    </div>
  );
}
