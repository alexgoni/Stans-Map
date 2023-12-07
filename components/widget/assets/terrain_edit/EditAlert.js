export default function EditAlert({ editTerrainOn }) {
  return (
    <span
      className={`relative left-1 top-1 h-3 w-3 ${
        editTerrainOn ? "flex" : "hidden"
      }`}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500" />
    </span>
  );
}
