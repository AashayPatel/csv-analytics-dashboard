export function detectFieldTypes(data, headers) {
  const types = {};

  headers.forEach((header) => {
    const values = data.map((row) => row[header]).filter((v) => v && v !== '');

    if (values.length === 0) {
      types[header] = 'empty';
      return;
    }

    const numericValues = values.filter((v) => !isNaN(parseFloat(v)) && isFinite(v));
    if (numericValues.length > values.length * 0.8) {
      types[header] = 'numeric';
      return;
    }

    const dateValues = values.filter((v) => !isNaN(Date.parse(v)));
    if (dateValues.length > values.length * 0.8) {
      types[header] = 'date';
      return;
    }

    types[header] = 'categorical';
  });

  return types;
}
