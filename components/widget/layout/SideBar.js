import React from "react";

export default function SideBar() {
  return (
    <>
      <aside
        class="fixed left-0 z-40 h-screen w-20 -translate-x-full transition-transform sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div class="h-full overflow-y-auto bg-gray-800 px-3 py-4"></div>
      </aside>
    </>
  );
}
