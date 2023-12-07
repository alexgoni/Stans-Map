import { useState } from "react";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

export default function ShowButton({ controller, id }) {
  const [showState, setShowState] = useState(false);

  return (
    <div
      className="flex h-10 w-10 cursor-pointer items-center justify-center"
      onClick={() => {
        controller.toggleShowGroup(id, showState);
        setShowState(!showState);
      }}
    >
      {showState ? (
        <EyeSlashFill className="text-red-500 hover:text-red-600" />
      ) : (
        <EyeFill className="text-slate-500 hover:text-slate-600" />
      )}
    </div>
  );
}
