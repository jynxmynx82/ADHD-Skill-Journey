/**
 * Validation Library
 * Provides consistent validation across the app using Yup schemas
 */

import React from 'react';
import * as yup from 'yup';
import { ERROR_CODES, createValidationError } from './errorHandling';

// Common validation patterns
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;

// Custom validation messages
const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  passwordConfirm: 'Passwords must match',
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  invalidFormat: (field: string) => `Please enter a valid ${field}`,
  phone: 'Please enter a valid phone number',
  positiveNumber: 'Please enter a positive number',
  futureDate: 'Please select a future date',
  pastDate: 'Please select a past date',
};

// Base schemas
export const emailSchema = yup
  .string()
  .required(VALIDATION_MESSAGES.required)
  .matches(EMAIL_REGEX, VALIDATION_MESSAGES.email);

export const passwordSchema = yup
  .string()
  .required(VALIDATION_MESSAGES.required)
  .min(8, VALIDATION_MESSAGES.minLength('Password', 8))
  .matches(PASSWORD_REGEX, VALIDATION_MESSAGES.password);

export const nameSchema = yup
  .string()
  .required(VALIDATION_MESSAGES.required)
  .min(2, VALIDATION_MESSAGES.minLength('Name', 2))
  .max(50, VALIDATION_MESSAGES.maxLength('Name', 50))
  .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const phoneSchema = yup
  .string()
  .matches(PHONE_REGEX, VALIDATION_MESSAGES.phone)
  .optional();

// Authentication schemas
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required(VALIDATION_MESSAGES.required),
});

export const signupSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required(VALIDATION_MESSAGES.required)
    .oneOf([yup.ref('password')], VALIDATION_MESSAGES.passwordConfirm),
  firstName: nameSchema,
  lastName: nameSchema,
});

export const resetPasswordSchema = yup.object({
  email: emailSchema,
});

// Profile schemas
export const profileSchema = yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: yup
    .date()
    .max(new Date(), VALIDATION_MESSAGES.pastDate)
    .optional(),
});

// Journal schemas
export const journalEntrySchema = yup.object({
  content: yup
    .string()
    .required(VALIDATION_MESSAGES.required)
    .min(1, 'Journal entry cannot be empty')
    .max(5000, VALIDATION_MESSAGES.maxLength('Journal entry', 5000)),
  mood: yup
    .number()
    .min(1, 'Mood must be between 1 and 5')
    .max(5, 'Mood must be between 1 and 5')
    .optional(),
  tags: yup
    .array()
    .of(yup.string().min(1).max(20))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
});

// Schedule schemas
export const scheduleItemSchema = yup.object({
  title: yup
    .string()
    .required(VALIDATION_MESSAGES.required)
    .min(1, VALIDATION_MESSAGES.minLength('Title', 1))
    .max(100, VALIDATION_MESSAGES.maxLength('Title', 100)),
  description: yup
    .string()
    .max(500, VALIDATION_MESSAGES.maxLength('Description', 500))
    .optional(),
  startTime: yup
    .date()
    .required('Start time is required'),
  endTime: yup
    .date()
    .min(yup.ref('startTime'), 'End time must be after start time')
    .required('End time is required'),
  daysOfWeek: yup
    .array()
    .of(yup.number().min(0).max(6))
    .min(1, 'At least one day must be selected')
    .required(),
});

// Food scanner schemas
export const barcodeSchema = yup
  .string()
  .matches(/^\d{8,13}$/, 'Barcode must be 8-13 digits')
  .required(VALIDATION_MESSAGES.required);

// Child profile schemas
export const childProfileSchema = yup.object({
  name: nameSchema,
  dateOfBirth: yup
    .date()
    .max(new Date(), VALIDATION_MESSAGES.pastDate)
    .required('Date of birth is required'),
  age: yup
    .number()
    .positive(VALIDATION_MESSAGES.positiveNumber)
    .max(18, 'Child must be 18 or younger')
    .optional(),
  notes: yup
    .string()
    .max(1000, VALIDATION_MESSAGES.maxLength('Notes', 1000))
    .optional(),
});

// Skill Journey schemas
export const skillSchema = yup.object({
  name: yup
    .string()
    .required(VALIDATION_MESSAGES.required)
    .min(2, VALIDATION_MESSAGES.minLength('Skill name', 2))
    .max(100, VALIDATION_MESSAGES.maxLength('Skill name', 100)),
  description: yup
    .string()
    .required(VALIDATION_MESSAGES.required)
    .min(10, VALIDATION_MESSAGES.minLength('Description', 10))
    .max(500, VALIDATION_MESSAGES.maxLength('Description', 500)),
  category: yup
    .string()
    .required(VALIDATION_MESSAGES.required)
    .oneOf(['self-care', 'academic', 'social', 'emotional', 'physical', 'creative', 'life-skills', 'technology', 'custom']),
  difficulty: yup
    .string()
    .required(VALIDATION_MESSAGES.required)
    .oneOf(['beginner', 'intermediate', 'advanced']),
  estimatedDays: yup
    .number()
    .required(VALIDATION_MESSAGES.required)
    .min(1, 'Must be at least 1 day')
    .max(365, 'Must be less than 1 year'),
  parentNotes: yup
    .string()
    .max(1000, VALIDATION_MESSAGES.maxLength('Notes', 1000))
    .optional(),
});

// Validation utility functions
export async function validateField<T>(
  schema: yup.Schema<T>,
  value: any,
  fieldName: string
): Promise<{ isValid: boolean; error: string | null }> {
  try {
    await schema.validate(value);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'Validation failed' };
  }
}

export async function validateForm<T extends Record<string, any>>(
  schema: yup.ObjectSchema<T>,
  values: any
): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

// Real-time validation hook
export function useFieldValidation<T>(
  schema: yup.Schema<T>,
  fieldName: string
) {
  const [error, setError] = React.useState<string | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  const validate = React.useCallback(async (value: any) => {
    setIsValidating(true);
    try {
      await schema.validate(value);
      setError(null);
      return true;
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        setError(validationError.message);
      } else {
        setError('Validation failed');
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [schema]);

  return { error, isValidating, validate };
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d\s\-\(\)\+]/g, '');
}

// Format validation
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export function isValidBarcode(barcode: string): boolean {
  return /^\d{8,13}$/.test(barcode);
}

// Export all schemas
export const schemas = {
  login: loginSchema,
  signup: signupSchema,
  resetPassword: resetPasswordSchema,
  profile: profileSchema,
  journalEntry: journalEntrySchema,
  scheduleItem: scheduleItemSchema,
  barcode: barcodeSchema,
  childProfile: childProfileSchema,
  skillJourney: skillSchema,
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema,
}; 