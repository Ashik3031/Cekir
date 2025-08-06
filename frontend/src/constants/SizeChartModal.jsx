import { SIZE_GUIDES } from "./sizeGuide";

const SizeChartModal = ({ isOpen, onClose, category, subCategory }) => {
  const key = (category + subCategory).toLowerCase().replace(/\s+/g, "");
  const guide = SIZE_GUIDES[key];
  console.log("key:", key);

  if (!isOpen || !guide) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{guide.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col lg:flex-row">
          {/* Table */}
          <div className="lg:w-2/3 mb-6 lg:mb-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {guide.measurements.map((m, i) => (
                    <th key={i} className="px-4 py-2 border-b text-gray-600">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-100">
                    {row.map((val, j) => (
                      <td key={j} className="px-4 py-2 border-b">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Guide */}
          <div className="lg:w-1/3 lg:pl-6">
            <h3 className="font-semibold mb-3 text-lg">{guide.guideText}</h3>
            <ul className="list-disc ml-5 text-sm text-gray-600 space-y-2">
              {guide.steps.map(([label, desc], i) => (
                <li key={i}>
                  <strong>{label}:</strong> {desc}
                </li>
              ))}
            </ul>
            <img
              src="https://img.freepik.com/premium-vector/illustration-contoured-man-women-boy-full-length-with-measurement-lines-body-parameters-man-women-child-sizes-measurements_111701-239.jpg"
              alt="Measuring Guide"
              className="mt-4 w-full object-contain rounded-md border"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
