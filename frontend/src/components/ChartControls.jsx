import React from 'react';

export default function ChartControls({
  headers,
  fieldTypes,
  chartType,
  setChartType,
  selectedXField,
  setSelectedXField,
  selectedYFields,
  setSelectedYFields,
}) {
  const chartTypes = ['bar', 'line', 'pie', 'scatter'];

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chart Type Selector */}
        <div>
          <label className="block mb-1 text-sm font-medium text-foreground">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground dark:bg-zinc-800 dark:text-white"
          >
            {chartTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* X Field */}
        <div>
          <label className="block mb-1 text-sm font-medium text-foreground">
            {chartType === 'scatter' ? 'X-Axis (numeric)' : 'Category Field'}
          </label>
          <select
            value={selectedXField}
            onChange={(e) => setSelectedXField(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground dark:bg-zinc-800 dark:text-white"
          >
            <option value="">-- Select Field --</option>
            {headers
              .filter(h => chartType === 'scatter' ? fieldTypes[h] === 'numeric' : true)
              .map(header => (
                <option key={header} value={header}>
                  {header} ({fieldTypes[header]})
                </option>
              ))}
          </select>
        </div>

        {/* Y Field */}
        <div>
          <label className="block mb-1 text-sm font-medium text-foreground">
            {chartType === 'pie' ? 'Value Field' : 'Y-Axis (numeric)'}
          </label>
          <select
            multiple
            value={selectedYFields}
            onChange={(e) =>
              setSelectedYFields(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground dark:bg-zinc-800 dark:text-white"
          >
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
