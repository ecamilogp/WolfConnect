export interface ApiValidationIssue {
  field: string
  message: string
}

export interface ApiSuccessEnvelope {
  success: true
  message?: string
  data?: unknown
  [key: string]: unknown
}

export interface ApiErrorEnvelope {
  success: false
  message: string
  errors?: ApiValidationIssue[]
}
