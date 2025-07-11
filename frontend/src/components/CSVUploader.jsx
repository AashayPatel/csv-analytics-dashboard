import React, { useRef, useState } from 'react';

export default function CSVUploader({ onCSVParsed }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      onCSVParsed(csvText); // 👉 pass raw CSV to parent
    };
    reader.readAsText(file);
  };

return (
  <div className="border-2 border-dashed p-6 rounded-lg text-center">
    <p className="mb-4">{fileName || 'No file selected'}</p>
    <input
      type="file"
      accept=".csv"
      ref={fileInputRef}
      onChange={handleFileUpload}
      className="hidden"
    />
    <button
      onClick={() => fileInputRef.current?.click()}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Choose CSV File
    </button>
  </div>
  );
}