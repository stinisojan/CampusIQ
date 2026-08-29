const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found with the specified ID.';
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered.';
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size limit exceeded.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
