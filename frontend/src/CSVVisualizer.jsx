import React, { useState, useEffect } from 'react';
import axios from "axios";
import CSVUploader from './components/CSVUploader';
import { parseCSV } from './components/CSVParser';
import { detectFieldTypes } from './utils/detectFieldTypes';
import ChartRenderer from './components/ChartRenderer';
import ChartControls from './components/ChartControls';
import SavedChartList from './components/SavedChartList';
import EditChartModal from './components/EditChartModal';
import socket from "./lib/socket";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import InviteModal from './components/InviteModal';
import PendingInvites from './components/PendingInvites';

export default function CSVVisualizer() {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fieldTypes, setFieldTypes] = useState({}); 

  const [selectedXField, setSelectedXField] = useState('');
  const [selectedYFields, setSelectedYFields] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [fileName, setFileName] = useState('');
  const [savedCharts, setSavedCharts] = useState([]);
  const [chartToEdit, setChartToEdit] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  
  
  // Add state for auth token
  const [authToken, setAuthToken] = useState(null);

  // Get token from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
  }, []);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/charts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedCharts(res.data);
      } catch (err) {
        console.error("Error fetching saved charts:", err);
      }
    };
    fetchCharts();
  }, []);

  useEffect(() => {
    const chartId = chartToEdit?._id;
    if (!chartId) return;

    socket.emit("join-room", chartId);
    const listener = (updates) => {
      if (updates.field === "x") setSelectedXField(updates.value);
      else if (updates.field === "y") setSelectedYFields(updates.value);
      else if (updates.field === "type") setChartType(updates.value);
      else if (updates.field === "name") setFileName(updates.value);
    };

    socket.on("receive-update", listener);
    return () => {
      socket.off("receive-update", listener);
      socket.emit("leave-room", chartId);
    };
  }, [chartToEdit?._id]);

  const handleRawCSV = (rawCSV) => {
    const { headers, data } = parseCSV(rawCSV);
    const types = detectFieldTypes(data, headers);
    setCsvData(data);
    setHeaders(headers);
    setFieldTypes(types);

    const firstCategorical = headers.find(h => types[h] === 'categorical') || headers[0];
    const firstNumeric = headers.find(h => types[h] === 'numeric') || headers[1];

    setSelectedXField(firstCategorical);
    setSelectedYFields(firstNumeric ? [firstNumeric] : []);
  };

  const handleSaveChart = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        fileName,
        chartType,
        selectedXField,
        selectedYFields,
        headers,
        fieldTypes,
        csvData,
      };

      const response = await fetch("http://localhost:5000/api/charts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save chart config");
      const savedChart = await response.json();
      setSavedCharts(prev => [...prev, savedChart]);
      alert("Chart configuration saved successfully!");
    } catch (error) {
      console.error("❌ Error saving chart:", error);
      alert("Failed to save chart");
    }
  };

  const handleSocketUpdate = ({ field, value }) => {
    if (field === "x") setSelectedXField(value);
    else if (field === "y") setSelectedYFields(value);
    else if (field === "type") setChartType(value);
    else if (field === "name") setFileName(value);
  };

  return (
    <main className="pt-10">
      {/* Page content below navbar */}
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">CSV Visualizer</h1>

        <PendingInvites /> 

        <CSVUploader onCSVParsed={handleRawCSV} />

        <ChartControls
          headers={headers}
          fieldTypes={fieldTypes}
          chartType={chartType}
          setChartType={setChartType}
          selectedXField={selectedXField}
          setSelectedXField={setSelectedXField}
          selectedYFields={selectedYFields}
          setSelectedYFields={setSelectedYFields}
        />

        <ChartRenderer
          csvData={csvData}
          selectedXField={selectedXField}
          selectedYFields={selectedYFields}
          chartType={chartType}
        />

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Chart name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <Button onClick={handleSaveChart}>Save Chart</Button>
        </div>

        {savedCharts.length === 0 ? (
          <p className="text-muted-foreground">No saved charts found.</p>
        ) : (
          <SavedChartList
            savedCharts={savedCharts}
            setCsvData={setCsvData}
            setHeaders={setHeaders}
            setFieldTypes={setFieldTypes}
            setSavedCharts={setSavedCharts}
            setSelectedXField={setSelectedXField}
            setSelectedYFields={setSelectedYFields}
            setChartType={setChartType}
            setChartToEdit={setChartToEdit}
            setInviteOpen={setInviteOpen}
          />
        )}

        {chartToEdit && (
          <EditChartModal
            chart={chartToEdit}
            onClose={() => setChartToEdit(null)}
            onSave={async () => {
              try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:5000/api/charts/${chartToEdit._id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    fileName,
                    chartType,
                    selectedXField,
                    selectedYFields,
                  }),
                });

                if (!response.ok) throw new Error("Failed to update chart");
                const { chart: updatedChart } = await response.json();
                setSavedCharts(prev => prev.map(c => c._id === updatedChart._id ? updatedChart : c));
                setChartToEdit(null);
                alert("✅ Chart updated successfully!");
              } catch (error) {
                console.error("❌ Error updating chart:", error);
                alert("Failed to update chart");
              }
            }}
            fileName={fileName}
            setFileName={setFileName}
            selectedXField={selectedXField}
            selectedYFields={selectedYFields}
            chartType={chartType}
            setSelectedXField={setSelectedXField}
            setSelectedYFields={setSelectedYFields}
            setChartType={setChartType}
            onSocketUpdate={handleSocketUpdate}
          />
        )}

        {chartToEdit && (
          <InviteModal
            chartId={chartToEdit._id}
            isOpen={inviteOpen}
            onClose={() => setInviteOpen(false)}
            token={authToken} // Now using the properly defined authToken
          />
        )}

        {headers.length > 0 && (
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-2">Detected Headers</h2>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              {headers.map((header) => (
                <li key={header}>
                  {header} <em>({fieldTypes[header]})</em>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">First 3 Rows:</h3>
            <pre className="bg-muted p-4 rounded text-sm overflow-x-auto dark:bg-zinc-900">
              {JSON.stringify(csvData.slice(0, 3), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}