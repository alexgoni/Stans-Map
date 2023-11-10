import React, { useState } from "react";

export default function slider() {
  const [height, setHeight] = useState(38);

  const slideHandler = (e) => {
    console.log(e.target.value);
    setHeight(e.target.value);
  };

  return (
    <>
      <div class="fixed left-5 top-5 z-10">
        <input
          type="range"
          min="0"
          max="500"
          value={height}
          onChange={slideHandler}
          class="slider"
          id="myRange"
        />
      </div>
    </>
  );
}
