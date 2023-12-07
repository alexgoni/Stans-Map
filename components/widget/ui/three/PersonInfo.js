export default function PersonInfo() {
  return (
    <table className="fixed left-24 top-1/2 z-50 flex -translate-y-1/2 transform flex-col justify-center rounded-md border-2 border-black bg-gray-200 p-2 opacity-70">
      <thead className="flex justify-center">
        <tr>
          <th className="border-b px-4 py-2 text-center">Description</th>
        </tr>
      </thead>
      <tbody className="text-center">
        <tr>
          <td className="border-b px-8 py-2">이름</td>
          <td className="border-b px-8 py-2">천권희</td>
        </tr>
        <tr>
          <td className="border-b px-8 py-2">직책</td>
          <td className="border-b px-8 py-2">인턴</td>
        </tr>
        <tr>
          <td className="border-b px-8 py-2">업무</td>
          <td className="border-b px-8 py-2">프론트엔드 및 GUI</td>
        </tr>
        <tr>
          <td className="border-b px-8 py-2">위치</td>
          <td className="border-b px-8 py-2">413호</td>
        </tr>
      </tbody>
    </table>
  );
}
