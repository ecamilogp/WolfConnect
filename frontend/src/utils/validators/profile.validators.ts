import { z } from 'zod'

import { createPasswordSchema, nameRegex, usernameRegex } from './auth.validators'

type Translate = (key: string) => string

export function createUpdateProfileSchema(t: Translate) {
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(2, t('validation.firstName.minLength'))
      .max(50, t('validation.firstName.maxLength'))
      .regex(nameRegex, t('validation.firstName.invalidChars')),

    lastName: z
      .string()
      .trim()
      .min(2, t('validation.lastName.minLength'))
      .max(50, t('validation.lastName.maxLength'))
      .regex(nameRegex, t('validation.lastName.invalidChars')),

    username: z
      .string()
      .trim()
      .min(3, t('validation.username.minLength'))
      .max(30, t('validation.username.maxLength'))
      .regex(usernameRegex, t('validation.username.invalidChars')),
  })
}

export function createChangePasswordSchema(t: Translate) {
  return z
    .object({
      currentPassword: z.string().min(1, t('validation.password.required')),
      newPassword: createPasswordSchema(t),
      confirmPassword: z.string().min(1, t('validation.password.required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.password.mismatch'),
      path: ['confirmPassword'],
    })
}

export type UpdateProfileFormValues = z.infer<ReturnType<typeof createUpdateProfileSchema>>
export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>
