export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        ...(err.details && { details: err.details }),
    });
};
// 404 handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};
// Async handler wrapper to catch errors
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// Create error with status code
export const createError = (message, statusCode, details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    return error;
};
//# sourceMappingURL=error.middleware.js.map