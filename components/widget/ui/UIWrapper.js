import Toolbar from "./tool/Toolbar";
import Rightbar from "./Rightbar";
import SearchWidget from "./SearchWidget";

export default function UIWrapper({ viewer, toolData }) {
  return (
    <>
      <SearchWidget />
      <Toolbar viewer={viewer} toolData={toolData} />
      <Rightbar viewer={viewer} />
    </>
  );
}
