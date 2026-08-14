import { z } from 'zod'

export const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$/
export const usernameRegex = /^[a-zA-Z0-9._]+$/

type Translate = (key: string) => string

export function createPasswordSchema(t: Translate) {
  return z
    .string()
    .min(8, t('validation.password.minLength'))
    .max(100, t('validation.password.maxLength'))
    .regex(/[a-z]/, t('validation.password.lowercase'))
    .regex(/[A-Z]/, t('validation.password.uppercase'))
    .regex(/[0-9]/, t('validation.password.number'))
    .regex(/[!@#$%^&*()_\-+=\\[\]{};:'",.<>/?\\|`~]/, t('validation.password.specialChar'))
    .regex(/^\S+$/, t('validation.password.noSpaces'))
}

export function createLoginSchema(t: Translate) {
  return z.object({
    email: z.string().trim().toLowerCase().pipe(z.email({ message: t('validation.email.invalid') })),
    password: z.string().min(1, t('validation.password.required')),
  })
}

export function createRegisterSchema(t: Translate) {
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

    email: z.string().trim().toLowerCase().pipe(z.email({ message: t('validation.email.invalid') })),

    password: createPasswordSchema(t),

    invitationToken: z.string().trim().min(1).optional(),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>
