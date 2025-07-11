import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BasicBarChart() {
  const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green'],
    datasets: [{
      label: 'Votes',
      data: [12, 19, 3, 5],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Sample Bar Chart'
      }
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Chart Preview</h2>
      <Bar data={data} options={options} />
    </div>
  );
}
