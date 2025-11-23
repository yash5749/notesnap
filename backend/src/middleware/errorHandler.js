import logger from '../utils/logger.js';
import { ApiError } from '../utils/index.js';

export const errorHandler = (err, req, res, next) => {
    let error = err;

    // Log the error
    logger.error('Error:', error);

    // If not an instance of ApiError, create a new ApiError
    if (!(error instanceof ApiError)) {
        // Mongoose duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            error = new ApiError(400, `${field} already exists`);
        }

        // Mongoose validation error
        else if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(error => error.message);
            error = new ApiError(400, 'Validation failed', messages);
        }

        // Mongoose CastError (invalid ObjectId)
        else if (error.name === 'CastError') {
            error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
        }

        // JWT errors
        else if (error.name === 'JsonWebTokenError') {
            error = new ApiError(401, 'Invalid token');
        } else if (error.name === 'TokenExpiredError') {
            error = new ApiError(401, 'Token expired');
        }

        // Multer errors
        else if (error.code === 'LIMIT_FILE_SIZE') {
            error = new ApiError(400, 'File too large. Maximum size is 10MB');
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            error = new ApiError(400, 'Unexpected field in file upload');
        }

        // Default to internal server error
        else {
            error = new ApiError(500, error.message || 'Internal Server Error');
        }
    }

    // Send error response
    return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

export const notFound = (req, res) => {
    throw new ApiError(404, `Route ${req.originalUrl} not found`);
};