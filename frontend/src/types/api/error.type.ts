import type { ApiValidationIssue } from './response.type'

export class ApiError extends Error {
  readonly statusCode: number
  readonly errors?: ApiValidationIssue[]

  constructor(message: string, statusCode: number, errors?: ApiValidationIssue[]) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}
