import { GeoAltFill, Search } from "react-bootstrap-icons";

export default function SearchWidget() {
  return (
    <div className="fixed left-5 top-6 z-50">
      <div className="flex items-center gap-2 rounded-lg border-b-2 border-gray-300 bg-gray-100 p-2 shadow-2xl">
        <GeoAltFill className="cursor-pointer text-xl text-blue-400" />
        <input
          type="text"
          className="w-56 bg-gray-100 outline-none"
          placeholder="Search places and addresses"
        />
        <Search className="mt-0.5 cursor-pointer text-lg text-blue-400" />
      </div>
    </div>
  );
}
