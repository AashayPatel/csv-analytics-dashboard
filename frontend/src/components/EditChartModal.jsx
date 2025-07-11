import socket from "../lib/socket"; 
import { useEffect, useRef } from "react";

export default function EditChartModal({
  chart,
  onClose,
  onSave,
  selectedXField,
  selectedYFields,
  chartType,
  setSelectedXField,
  setSelectedYFields,
  setChartType,
  fileName,
  setFileName,
  onSocketUpdate,
}) {
  if (!chart) return null;
  const chartId = chart._id;
  const tabId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    if (socket.connected) {
      socket.emit("join-room", chartId);
    } else {
      socket.on("connect", () => socket.emit("join-room", chartId));
    }
    return () => {
      socket.emit("leave-room", chartId);
    };
  }, [chartId]);

  useEffect(() => {
    const handleReceiveUpdate = ({ type, field, value }) => {
      if (type === "field-change" && typeof onSocketUpdate === "function") {
        onSocketUpdate({ field, value });
      }
    };
    socket.on("receive-update", handleReceiveUpdate);
    return () => socket.off("receive-update", handleReceiveUpdate);
  }, [onSocketUpdate]);

  const handleFieldUpdate = (field, value) => {
    socket.emit("chart-update", {
      chartId,
      updates: {
        type: "field-change",
        field,
        value,
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}></div>

      <div
        className="fixed top-1/2 left-1/2 z-50 w-[90%] sm:w-[500px] bg-white dark:!bg-zinc-900 dark:text-white rounded-xl shadow-xl p-6"
        style={{ transform: 'translate(-50%, -50%)', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-6 pr-8">✏️ Edit Chart</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Chart Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              handleFieldUpdate("name", e.target.value);
            }}
            className="w-full border border-input rounded-md px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => {
                setChartType(e.target.value);
                handleFieldUpdate("type", e.target.value);
              }}
              className="w-full border border-input rounded-md px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">X-Axis Field</label>
            <select
              value={selectedXField}
              onChange={(e) => {
                setSelectedXField(e.target.value);
                handleFieldUpdate("x", e.target.value);
              }}
              className="w-full border border-input rounded-md px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white"
            >
              {chart.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Y-Axis Field(s)</label>
            <select
              multiple
              value={selectedYFields}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                setSelectedYFields(selectedOptions);
                handleFieldUpdate("y", selectedOptions);
              }}
              className="w-full border border-input rounded-md px-3 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white h-auto min-h-[42px]"
            >
              {chart.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Hold Ctrl/Cmd to select multiple fields
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-input text-black dark:text-white bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}