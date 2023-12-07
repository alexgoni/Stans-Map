import { useEffect, useState } from "react";
import ReactModal from "react-modal";
import Loading from "../../loading/Loading";
import { XLg } from "react-bootstrap-icons";
import FirstPerson from "../../../handler/three/FirstPerson";

ReactModal.setAppElement("#__next");

const modalStyle = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
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
};

export default function ThreeModal({ isOpen, closeModal, filePath }) {
  const [loading, setLoading] = useState(true);
  const loadingState = { loading, setLoading };

  useEffect(() => {
    setLoading(true);
  }, [isOpen]);

  return (
    <>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={closeModal}
        contentLabel="Model 2 Modal"
        style={modalStyle}
      >
        <XLg
          className="fixed right-8 top-8 z-50 cursor-pointer text-3xl text-gray-200"
          onClick={closeModal}
        />
        <FirstPerson filePath={filePath} loadingState={loadingState} />
        {loading && <Loading transparent={true} />}
      </ReactModal>
    </>
  );
}
