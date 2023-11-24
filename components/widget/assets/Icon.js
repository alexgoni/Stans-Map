export default function Icon({ icon, widgetOpen, clickHandler }) {
  return (
    <div
      className={`cursor-pointer text-2xl ${
        widgetOpen
          ? "text-blue-500 hover:text-blue-600"
          : "text-slate-600 hover:text-slate-800"
      }`}
      onClick={clickHandler}
    >
      {icon}
    </div>
  );
}
