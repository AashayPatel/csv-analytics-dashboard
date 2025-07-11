// src/components/PublicChart.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChartRenderer from "./ChartRenderer";

export default function PublicChart() {
  const { id } = useParams();
  const [chart, setChart] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/charts/public/${id}`);
        if (!res.ok) throw new Error("Chart not found");
        const data = await res.json();
        const chartData = data.chart || data;
        
        
        setChart(chartData);
      } catch (err) {
        console.error("Error fetching chart:", err);
        setError("Chart not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [id]);

  if (loading) return <p className="text-center">Loading chart...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!chart) return <p className="text-center">No chart data available.</p>;

  let selectedYFields = chart.selectedYFields;
  
  if (!selectedYFields || !Array.isArray(selectedYFields) || selectedYFields.length === 0) {
    if (chart.selectedYField) {
      selectedYFields = [chart.selectedYField];
    } else if (chart.headers && chart.headers.length > 1) {
      selectedYFields = [chart.headers[1]];
    } else if (chart.csvData && chart.csvData.length > 0) {
      const firstRow = chart.csvData[0];
      const columns = Object.keys(firstRow);
      if (columns.length > 1) {
        selectedYFields = [columns[1]];
      }
    }
  }

  const hasValidData = chart.csvData && 
                       Array.isArray(chart.csvData) && 
                       chart.csvData.length > 0 &&
                       chart.selectedXField &&
                       selectedYFields &&
                       Array.isArray(selectedYFields) &&
                       selectedYFields.length > 0 &&
                       chart.chartType;

  if (!hasValidData) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-center mb-4">{chart.fileName || "Chart"}</h2>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p className="font-bold">Chart Data Issues:</p>
          <ul className="list-disc list-inside mt-2">
            {!chart.csvData && <li>Missing CSV data</li>}
            {chart.csvData && !Array.isArray(chart.csvData) && <li>CSV data is not an array</li>}
            {chart.csvData && Array.isArray(chart.csvData) && chart.csvData.length === 0 && <li>CSV data is empty</li>}
            {!chart.selectedXField && <li>Missing X-axis field</li>}
            {!chart.selectedYFields && <li>Missing Y-axis fields</li>}
            {chart.selectedYFields && !Array.isArray(chart.selectedYFields) && <li>Y-axis fields is not an array</li>}
            {chart.selectedYFields && Array.isArray(chart.selectedYFields) && chart.selectedYFields.length === 0 && <li>Y-axis fields is empty</li>}
            {!chart.chartType && <li>Missing chart type</li>}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-4">{chart.fileName || "Chart"}</h2>
      <ChartRenderer
        csvData={chart.csvData}
        selectedXField={chart.selectedXField}   
        selectedYFields={selectedYFields}
        chartType={chart.chartType}
      />
      <div className="mt-4 text-center">
        <a
          href={`/chart/${chart._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Public view — /chart/{chart._id}
        </a>
      </div>
    </div>
  );
}