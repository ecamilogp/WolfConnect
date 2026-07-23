import { AppError } from './app-error.js';

export interface ValidationIssue {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  constructor(public readonly errors: ValidationIssue[]) {
    super('Validation failed.', 400);
  }
}
