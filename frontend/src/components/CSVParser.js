// components/CSVParser.js
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return { headers, data };
}
