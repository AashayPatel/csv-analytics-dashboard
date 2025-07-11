import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale);

export default function ChartView() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token"); // assuming you're saving it
      
      const res = await axios.get("http://localhost:5000/api/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log("Token:", token);

      const rows = res.data;

      const labels = rows.map((row) => row.region || "Unknown");
      const data = rows.map((row) => parseInt(row.employeeCount || 0));

      setChartData({
        labels,
        datasets: [
          {
            label: "Employee Count by Region",
            data,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      });
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📊 Employee Distribution</h2>
      {chartData ? <Bar data={chartData} /> : <p>Loading chart...</p>}
    </div>
  );
}
