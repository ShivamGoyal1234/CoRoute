import { body, param, query } from 'express-validator';

export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const validateTrip = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('baseCurrency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
];

export const validateDay = [
  body('tripId').isMongoId().withMessage('Valid trip ID required'),
  body('dayNumber').isInt({ min: 1 }).withMessage('Day number must be positive'),
  body('date').isISO8601().withMessage('Valid date required'),
];

export const validateActivity = [
  body('dayId').isMongoId().withMessage('Valid day ID required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be positive'),
];

export const validateComment = [
  body('activityId').isMongoId().withMessage('Valid activity ID required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
];

export const validateChecklist = [
  body('tripId').isMongoId().withMessage('Valid trip ID required'),
  body('task').trim().notEmpty().withMessage('Task is required'),
];

export const validateWebhook = [
  body('tripId').isMongoId().withMessage('Valid trip ID required'),
  body('url').isURL().withMessage('Valid URL required'),
  body('events').isArray({ min: 1 }).withMessage('At least one event required'),
];

export const validateMongoId = [
  param('id').isMongoId().withMessage('Valid ID required'),
];
