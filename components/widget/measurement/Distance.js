import { useEffect, useState } from "react";

function DistanceContainer() {
  const [drawLine, setDrawLine] = useState(false);

  const copyToClipboard = (surfaceDistance) => {
    navigator.clipboard
      .writeText(surfaceDistance)
      .then(() => {
        alert("copy!");
      })
      .catch((err) => {
        console.error("복사 실패:", err);
      });
  };

  useEffect(() => {}, []);

  return (
    <>
      {drawLine ? (
        <XLg className="text-2xl text-gray-200" />
      ) : (
        <Rulers className="text-2xl text-gray-200" />
      )}
    </>
  );
}

function DistanceWidget() {}

export { DistanceContainer };
