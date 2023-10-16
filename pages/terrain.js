import { useEffect, useState } from "react";

export default function MyComponent() {
  const [flag, setflag] = useState(false);
  useEffect(() => {
    return () => {
      console.log("hi");
    };
  }, [flag]);

  return (
    <div>
      <button onClick={() => setflag(!flag)}>Flag 버튼</button>
    </div>
  );
}
