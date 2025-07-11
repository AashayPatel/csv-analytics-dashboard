import React, { useState } from "react";
import axios from "axios";
import { detectFieldTypes } from "../utils/detectFieldTypes";
import ChartRenderer from "./ChartRenderer";
import { Button } from "./ui/button";

export default function SavedChartList({
  savedCharts,
  setCsvData,
  setHeaders,
  setFieldTypes,
  setSavedCharts,
  setSelectedXField,
  setSelectedYFields,
  setChartType,
  setChartToEdit,
  setInviteOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("date-desc");

  if (!Array.isArray(savedCharts)) {
    return <p className="text-red-500">⚠️ Invalid data: savedCharts is not an array</p>;
  }

  const handleDelete = async (chartId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to delete charts.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/charts/${chartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedCharts(savedCharts.filter((c) => c._id !== chartId));
    } catch (error) {
      console.error("❌ Error deleting chart:", error);
      alert("Failed to delete chart.");
    }
  };

  const filteredCharts = savedCharts
    .filter(chart =>
      chart.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === "all" || chart.chartType === filterType)
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "date-desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "name-asc":
          return (a.fileName || "").localeCompare(b.fileName || "");
        case "name-desc":
          return (b.fileName || "").localeCompare(a.fileName || "");
        default:
          return 0;
      }
    });

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-3">📁 Saved Charts</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by chart name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 px-3 py-3 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-black dark:text-white"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full sm:w-1/3 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-black dark:text-white"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-1/3 px-3 py-3 border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-black dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
          <option value="scatter">Scatter</option>
        </select>
      </div>

      {savedCharts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No saved charts found.</p>
      ) : (
        <div className="space-y-4">
          {filteredCharts.map((chart) => (
            <div
              key={chart._id}
              className="bg-white dark:bg-zinc-800 p-4 rounded shadow flex justify-between items-center"
            >
              <div className="w-[150px] h-[130px] overflow-hidden">
                <ChartRenderer
                  csvData={chart.csvData || []}
                  selectedXField={chart.selectedXField}
                  selectedYFields={chart.selectedYFields || [chart.headers?.[1]].filter(Boolean)}
                  chartType={chart.chartType}
                  compact={true}
                />
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white">{chart.fileName || "Untitled CSV"}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Saved on {new Date(chart.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCsvData(chart.csvData);
                    setHeaders(chart.headers);
                    const types = detectFieldTypes(chart.csvData, chart.headers);
                    setFieldTypes(types);
                    setSelectedXField(chart.selectedXField || chart.headers[0]);
                    setSelectedYFields(chart.selectedYFields || [chart.headers[1]]);
                    setChartType(chart.chartType || 'bar');
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Load
                </button>

                <button
                  onClick={() => setChartToEdit(chart)}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Edit
                </button>

                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    try {
                      const res = await fetch(`http://localhost:5000/api/charts/${chart._id}/share`, {
                        method: "PATCH",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const updated = await res.json();
                      alert("📤 Chart is now public!");
                      const publicUrl = `${window.location.origin}/chart/${chart._id}`;
                      navigator.clipboard.writeText(publicUrl);
                      alert(`🔗 Public link copied: ${publicUrl}`);
                    } catch (err) {
                      console.error("Failed to share chart", err);
                      alert("❌ Failed to make chart public.");
                    }
                  }}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Share
                </button>

                <Button
                  onClick={() => {
                    setInviteOpen(true);       // ✅ Open the invite modal
                    setChartToEdit(chart);     // ✅ Make this the active chart
                  }}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Invite
                </Button>

                <button
                  onClick={() => handleDelete(chart._id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
