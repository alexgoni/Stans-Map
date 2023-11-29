import Toolbar from "./tool/Toolbar";
import Rightbar from "./Rightbar";
import SearchWidget from "./SearchWidget";

export default function UIWrapper({ viewer, toolController }) {
  return (
    <>
      <SearchWidget />
      <Toolbar viewer={viewer} toolController={toolController} />
      <Rightbar viewer={viewer} />
    </>
  );
}
