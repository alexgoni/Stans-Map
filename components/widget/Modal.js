import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import Loading from "./Loading";
import { ArrowClockwise, XLg } from "react-bootstrap-icons";
import FirstPerson from "./FirstPerson";

ReactModal.setAppElement("#__next");

export default function Modal({ modalOpen, closeModal, filePath }) {
  const [loading, setLoading] = useState(true);
  const [initCameraFlag, setInitCameraFlag] = useState(false);
  const loadingState = { loading, setLoading };
  const cameraFlagState = { initCameraFlag, setInitCameraFlag };

  useEffect(() => {
    setLoading(true);
  }, [modalOpen]);

  return (
    <>
      <ReactModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="Model 2 Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            padding: "0",
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
        }}
      >
        <XLg
          className="fixed right-8 top-8 z-50 cursor-pointer text-3xl text-gray-200"
          onClick={closeModal}
        />
        <FirstPerson
          filePath={filePath}
          loadingState={loadingState}
          cameraFlagState={cameraFlagState}
        />
        {loading ? (
          <Loading />
        ) : (
          <div
            className="fixed bottom-12 right-12 z-50 flex h-12 w-14 cursor-pointer select-none items-center justify-center rounded-full
              border-[1px]  border-blue-400 bg-blue-500
              transition-all
              duration-150 [box-shadow:0_8px_0_0_#1b6ff8,0_13px_0_0_#1b70f841] active:translate-y-2
              active:border-b-[0px] active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]"
            onClick={() => {
              setInitCameraFlag(true);
            }}
          >
            <ArrowClockwise className="text-2xl text-slate-200" />
          </div>
        )}
      </ReactModal>
    </>
  );
}
