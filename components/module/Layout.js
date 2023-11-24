export default function Layout({ children }) {
  return (
    <>
      <div
        id="cesiumContainer"
        className="m-0 h-screen w-screen overflow-hidden p-0"
      ></div>
      {children}
    </>
  );
}
