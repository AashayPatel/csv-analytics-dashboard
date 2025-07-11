export const notFound = (req, res, next) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', {
    path: req.path,
    method: req.method,
    error: err.stack || err.message
  });

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};