import { body } from 'express-validator';

// User registration validation
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('fullName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Full name is required and must be between 1 and 50 characters'),

];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
export const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Warranty creation validation
export const validateWarrantyCreate = [
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('productSeries')
    .trim()
    .notEmpty()
    .withMessage('Product series is required'),

  body('constructionShop')
    .optional()
    .trim(),

  body('carColour')
    .optional()
    .trim(),

  body('licensePlate')
    .trim()
    .notEmpty()
    .withMessage('License plate is required'),

  body('carModel')
    .optional()
    .trim(),

  body('applicationDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Application date must be a valid date'),

  body('contactNumber')
    .optional()
    .trim(),

  body('detailTechnician')
    .optional()
    .trim(),

  body('filmCoreSerial')
    .optional()
    .trim(),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters')
];

// Warranty update validation (todos opcionales)
export const validateWarrantyUpdate = [
  body('country').optional().trim(),
  body('productSeries').optional().trim(),
  body('constructionShop').optional().trim(),
  body('carColour').optional().trim(),
  body('licensePlate').optional().trim(),
  body('carModel').optional().trim(),
  body('applicationDate').optional().isISO8601().toDate(),
  body('contactNumber').optional().trim(),
  body('detailTechnician').optional().trim(),
  body('filmCoreSerial').optional().trim(),
  body('tags').optional().isArray(),
  body('tags.*').optional().trim().isLength({ min: 1, max: 30 })
];

// Admin warranty update validation
export const validateAdminWarrantyUpdate = [
  ...validateWarrantyUpdate,

  body('status')
    .optional()
    .isIn(['pending', 'in_review', 'approved', 'rejected', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in_review, approved, rejected, completed, cancelled'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),

  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes must not exceed 1000 characters'),

  body('resolution')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Resolution must not exceed 1000 characters')
];

