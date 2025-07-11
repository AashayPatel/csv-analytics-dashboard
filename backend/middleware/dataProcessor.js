import DataRow from "../models/DataRow.model.js";

const detectFieldTypes = (rows) => {
  if (!rows || rows.length === 0) return {};
  
  const fieldTypes = {};
  const sampleSize = Math.min(100, rows.length);

  // First pass: collect all field names
  const allFields = new Set();
  rows.slice(0, sampleSize).forEach(row => {
    if (row.fields) {
      Object.keys(row.fields).forEach(field => allFields.add(field));
    }
  });

  // Second pass: detect types for each field
  Array.from(allFields).forEach(field => {
    const values = rows
      .map(row => row.fields?.[field])
      .filter(v => v !== null && v !== undefined && v !== '');

    if (values.length === 0) {
      fieldTypes[field] = 'empty';
      return;
    }

    // Enhanced numeric detection
    const numericValues = values.filter(v => {
      if (typeof v === 'number') return true;
      const num = Number(String(v).replace(/[^\d.-]/g, ''));
      return !isNaN(num) && isFinite(num) && v.toString().trim() !== '';
    });

    if (numericValues.length > values.length * 0.8) {
      fieldTypes[field] = numericValues.every(v => Number.isInteger(Number(v))) 
        ? 'integer' 
        : 'numeric';
      return;
    }

    // Date detection
    const dateValues = values.filter(v => {
      if (v instanceof Date) return true;
      const date = new Date(v);
      return !isNaN(date.getTime());
    });

    if (dateValues.length > values.length * 0.8) {
      fieldTypes[field] = 'date';
      return;
    }

    fieldTypes[field] = 'categorical';
  });

  return fieldTypes;
};

const transformNumbers = (data) => {
  return data.map(row => {
    const transformed = { ...row.fields };
    for (const key in transformed) {
      const value = transformed[key];
      
      if (value === null || value === undefined) {
        transformed[key] = null;
        continue;
      }

      // Handle numeric conversion
      if (typeof value === 'string') {
        const cleanValue = value
          .replace(/[^\d.-]/g, '')
          .replace(/(\d),(\d)/g, '$1$2');
        
        if (!isNaN(cleanValue)) {
          transformed[key] = Number(cleanValue);
        }
      } else if (typeof value === 'number') {
        transformed[key] = isFinite(value) ? value : null;
      }
    }
    return transformed;
  });
};

export const processDataResponse = async (req, res, next) => {
  try {
    const { fields, page = 1, limit = 100 } = req.query;
    
    // Base query
    const query = { uploadedBy: req.user.userId };
    
    // Field projection
    const projection = { _id: 0, __v: 0, uploadedBy: 0 };
    if (fields) {
      const selectedFields = fields.split(',');
      selectedFields.forEach(field => {
        projection[`fields.${field}`] = 1;
      });
    }

    // Fetch data with pagination
    const [data, total] = await Promise.all([
      DataRow.find(query)
        .select(projection)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      DataRow.countDocuments(query)
    ]);

    // Transform numbers
    const processedData = transformNumbers(data);

    // Detect field types
    const fieldTypes = detectFieldTypes(data);

    // Attach to response
    res.locals.processedData = {
      data: processedData,
      fieldTypes,
      count: total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };

    next();
  } catch (err) {
    console.error("Data processing error:", err);
    next(err);
  }
};

export const validateNumericField = (fieldPath) => {
  return (req, res, next) => {
    const field = req.params[fieldPath] || req.query[fieldPath];
    const fieldTypes = res.locals.processedData?.fieldTypes || {};
    
    if (!fieldTypes[field] || !['numeric', 'integer'].includes(fieldTypes[field])) {
      return res.status(400).json({
        success: false,
        error: "Invalid numeric field",
        message: `Field '${field}' must be numeric`,
        availableNumericFields: Object.entries(fieldTypes)
          .filter(([_, type]) => ['numeric', 'integer'].includes(type))
          .map(([name]) => name)
      });
    }
    
    next();
  };
};