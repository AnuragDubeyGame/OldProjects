const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
    code = 'FILE_TOO_LARGE';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
    code = 'UNEXPECTED_FILE';
  } else if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'File not found';
    code = 'FILE_NOT_FOUND';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    code = 'SERVICE_UNAVAILABLE';
  }

  // YouTube API specific errors
  if (err.message && err.message.includes('quota')) {
    statusCode = 429;
    message = 'YouTube API quota exceeded. Please try again later.';
    code = 'YOUTUBE_QUOTA_EXCEEDED';
  } else if (err.message && err.message.includes('forbidden')) {
    statusCode = 403;
    message = 'YouTube access denied. Please check your permissions.';
    code = 'YOUTUBE_ACCESS_DENIED';
  }

  // Supabase specific errors
  if (err.code === '23505') { // Unique violation
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_RESOURCE';
  } else if (err.code === '23503') { // Foreign key violation
    statusCode = 400;
    message = 'Invalid reference';
    code = 'INVALID_REFERENCE';
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    code: code,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

module.exports = {
  errorHandler
};
