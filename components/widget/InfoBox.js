import React, { useRef } from "react";
import * as Cesium from "cesium";
import { XLg } from "react-bootstrap-icons";

function popUpInfo({ pickedObject, model }) {
  const info = document.getElementById("info");

  if (Cesium.defined(pickedObject) && pickedObject.id === model) {
    // 인포박스 내용
    const buildingName = document.getElementById("building_name");
    const description = document.getElementById("description");
    const latitudeText = document.getElementById("latitude");
    const longitudeText = document.getElementById("longitude");

    // 모델 위도, 경도 구하기
    const cartesian = pickedObject.id.position._value;
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

    buildingName.innerHTML = pickedObject.id.name;
    description.innerHTML = pickedObject.id.description;
    latitudeText.innerHTML = latitude;
    longitudeText.innerHTML = longitude;

    info.style.display = "flex"; // 인포박스 표시
  }
}

function InfoBox({ closeEvent }) {
  const infoRef = useRef(null);
  let offsetX, offsetY;

  const handleMouseDown = (e) => {
    e.preventDefault();
    offsetX = e.clientX - infoRef.current.getBoundingClientRect().left;
    offsetY = e.clientY - infoRef.current.getBoundingClientRect().top;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    infoRef.current.style.left = e.clientX - offsetX + "px";
    infoRef.current.style.top = e.clientY - offsetY + "px";
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={infoRef}
      id="info"
      onMouseDown={handleMouseDown}
      className="absolute left-10 top-10 z-30 hidden cursor-move flex-col overflow-hidden rounded-lg border-4 border-black bg-slate-100 p-4 text-left"
    >
      <div className="flex justify-between ">
        <span className="mb-1 pl-1 text-xl font-semibold">건축물 정보</span>
        <XLg
          onClick={() => {
            info.style.display = "none";
            closeEvent();
          }}
          className="mr-1 mt-0.5 cursor-pointer text-xl text-gray-600"
        />
      </div>

      <div className="mx-2 flex flex-col-reverse gap-8">
        <table className="my-2 h-full w-[400px] rounded-lg bg-blue-600 text-lg text-blue-100 shadow-lg">
          <tbody>
            <tr className="border-b-2 border-gray-200">
              <td className="w-44 py-3 text-center font-medium text-white">
                Building Name
              </td>
              <td
                id="building_name"
                className="w-64 rounded-tr-lg bg-blue-500 px-2"
              >
                -
              </td>
            </tr>
            <tr className="border-b-2 border-gray-200">
              <td className="py-3 text-center font-medium text-white">
                Description
              </td>
              <td id="description" className="bg-blue-500 px-2">
                -
              </td>
            </tr>
            <tr className="border-b-2 border-gray-200">
              <td className="py-3 text-center font-medium text-white">위도</td>
              <td id="latitude" className="bg-blue-500 px-2">
                -
              </td>
            </tr>
            <tr className=" border-gray-200">
              <td className="py-3 text-center font-medium text-white">경도</td>
              <td id="longitude" className="rounded-br-lg bg-blue-500 px-2">
                -
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
export { popUpInfo, InfoBox };
