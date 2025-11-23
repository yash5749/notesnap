import { body, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Subject validation
export const validateSubject = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Subject name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  handleValidationErrors
];

// FIXED: Analysis validation - now using param() instead of body()
export const validateAnalysis = [
  param('subjectId')  // ✅ Changed from body() to param()
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  handleValidationErrors
];

// Document validation
export const validateDocumentUpload = [
  body('subjectId')
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  body('documentType')
    .isIn(['syllabus', 'notes', 'pyq', 'textbook'])
    .withMessage('Valid document type is required'),
  handleValidationErrors
];