import Header from "../widget/layout/Header";
import SideBar from "../widget/layout/SideBar";

export default function Layout({ children }) {
  return (
    <>
      {/* <Header />
      <SideBar /> */}
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      {children}
    </>
  );
}
