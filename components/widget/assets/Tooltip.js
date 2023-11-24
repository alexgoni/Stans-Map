export default function Tooltip({ contents }) {
  return (
    <div className="pointer-events-none absolute -bottom-10 left-1/2 flex w-max -translate-x-1/2 transform select-none items-center rounded-lg bg-slate-700 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
      <span className="text-xs text-white">{contents}</span>
    </div>
  );
}
