import { useEffect, useRef } from "react";

// useEffect 첫 실행 block
export default function useDidMountEffect(func, deps) {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) return func();
    else didMount.current = true;
  }, deps);
}
