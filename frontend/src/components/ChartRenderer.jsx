// src/components/ChartRenderer.jsx
import React, { useRef } from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import InviteModal from "./InviteModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const colorPalette = [
  '#FF6384', // red-pink
  '#36A2EB', // blue
  '#FFCE56', // yellow
  '#4BC0C0', // teal
  '#9966FF', // purple
  '#FF9F40', // orange
  '#8BC34A', // green
  '#E91E63', // magenta
];


export default function ChartRenderer({
  csvData,
  selectedXField,
  selectedYFields = [],
  chartType,
  compact = false,
}) {
  

  // Ensure selectedYFields is always an array
  const yFields = Array.isArray(selectedYFields) ? selectedYFields : [];
  const chartRef = useRef(null);
  if (!csvData.length || !selectedXField || !yFields.length) return null;

  const processedData = csvData.filter(
    (row) => row[selectedXField] && yFields.every(f => row[f])
  );

  let chartData, chartOptions;

  if (chartType === 'pie') {
    const aggregated = {};
    processedData.forEach((row) => {
      const category = row[selectedXField];
      const value = parseFloat(row[yFields[0]]) || 0;
      aggregated[category] = (aggregated[category] || 0) + value;
    });

    chartData = {
      labels: Object.keys(aggregated),
      datasets: [
        {
          data: Object.values(aggregated),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          ],
        },
      ],
    };

    chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: !compact },
      },
    };
  } else if (chartType === 'scatter') {
    chartData = {
      datasets: yFields.map((yField, index) => ({
        label: `${yField} vs ${selectedXField}`,
        data: processedData.map((row) => ({
          x: parseFloat(row[selectedXField]),
          y: parseFloat(row[yField]),
        })),
        backgroundColor: `rgba(54, 162, 235, ${0.6 - index * 0.1})`,
        borderColor: 'rgba(54, 162, 235, 1)',
      })),
    };

    chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: !compact },
      },
      scales: compact
        ? {}
        : {
            x: { beginAtZero: true },
            y: { beginAtZero: true },
          },
    };
  } else {
    // Bar or Line
    chartData = {
      labels: processedData.map((row) => row[selectedXField]),
      datasets: yFields.map((yField, index) => ({
        label: yField,
        data: processedData.map((row) => parseFloat(row[yField])),
        backgroundColor: chartType === 'line' ? `${colorPalette[index % colorPalette.length]}33` : colorPalette[index % colorPalette.length], // light fill for line
        borderColor: colorPalette[index % colorPalette.length],
        borderWidth: 2,
        fill: chartType !== 'line',
      }))
    };

    chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: !compact },
      },
      scales: compact
        ? {}
        : {
            y: { beginAtZero: true },
          },
    };
  }

  const ChartComponent =
    chartType === 'line'
      ? Line
      : chartType === 'pie'
      ? Pie
      : chartType === 'scatter'
      ? Scatter
      : Bar;

  return (
    
    <div
      className={`${
        compact ? '' : 'mt-8'
      } bg-white ${compact ? '' : 'p-4 rounded shadow'}`}
      style={compact ? { height: 130, width: 200 } : {}}
    >
      <ChartComponent
        ref={chartRef}
        data={chartData}
        options={chartOptions}
        height={compact ? 130 : undefined}
        width={compact ? 200 : undefined}
      />
        {!compact && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (chartRef.current) {
                    const url = chartRef.current.toBase64Image();
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${selectedXField}-${selectedYFields.join('_')}-${chartType}.png`;
                    link.click();
                  }
                }}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Download Image
              </button>
    
              <button
                onClick={() => {
                  const config = {
                    chartType,
                    selectedXField,
                    selectedYFields,
                    data: csvData,
                  };
                  const blob = new Blob([JSON.stringify(config, null, 2)], {
                    type: "application/json",
                  });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `${selectedXField}-${selectedYFields.join('_')}-config.json`;
                  link.click();
                }}
                className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
              >
                Export JSON
              </button>
            </div>
          )}
    </div>
  );
}