import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AppError, ErrorType } from './errorHandler';

// Validation middleware factory
export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: any[] = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    throw new AppError(
      'Validation failed',
      400,
      ErrorType.VALIDATION
    );
  };
};

// Common validation rules
export const userValidation = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces')
};

export const courseValidation = {
  title: body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  description: body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  category: body('category')
    .isIn(['machine-learning', 'deep-learning', 'nlp', 'computer-vision', 'data-science'])
    .withMessage('Invalid category'),
  
  difficulty: body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  price: body('price')
    .isNumeric()
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Price must be a valid number between 0 and 9999.99')
};

export const idValidation = {
  courseId: param('courseId')
    .isInt({ min: 1 })
    .withMessage('Course ID must be a positive integer'),
  
  userId: param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
};

export const queryValidation = {
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  search: query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters')
};