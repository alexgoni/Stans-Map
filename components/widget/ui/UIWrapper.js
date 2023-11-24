import Toolbar from "./tool/Toolbar";
import Rightbar from "./Rightbar";
import SearchWidget from "./SearchWidget";

export default function UIWrapper({ viewer }) {
  return (
    <>
      <SearchWidget />
      <Toolbar viewer={viewer} />
      <Rightbar viewer={viewer} />
    </>
  );
}
