import { z } from 'zod';

export const memberProfileSchema = z.object({
  displayName: z.string().min(2).max(120),
  phone: z.string().min(6).max(40).optional().or(z.literal('')),
  lineUserId: z.string().max(80).optional().or(z.literal('')),
  preferredLanguage: z.enum(['th', 'en']).default('th')
});

export const intakeSchema = z.object({
  fullName: z.string().min(2).max(160),
  email: z.string().email().max(180),
  phone: z.string().min(6).max(40),
  lineId: z.string().max(80).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  nationalIdLast4: z.string().regex(/^[0-9]{4}$/).optional().or(z.literal('')),
  currentSymptoms: z.string().max(2000).optional().or(z.literal('')),
  intendedUse: z.string().max(2000).optional().or(z.literal('')),
  allergies: z.string().max(1000).optional().or(z.literal('')),
  medications: z.string().max(1000).optional().or(z.literal('')),
  priorCannabisExperience: z.string().max(1000).optional().or(z.literal('')),
  requestTelemed: z.enum(['on', 'true']).optional(),
  telemedNote: z.string().max(1500).optional().or(z.literal('')),
  preferredTelemedDate: z.string().optional().or(z.literal('')),
  conditionIntention: z.string().min(2).max(2000),
  telemedConsent: z.enum(['on', 'true']).optional(),
  termsConsent: z.enum(['on', 'true']).optional(),
  signatureDataUrl: z.string().max(120000).optional().or(z.literal('')),
  website: z.string().max(200).optional().or(z.literal('')),
  pdpaConsent: z.enum(['on', 'true']),
  medicalIntakeConsent: z.enum(['on', 'true']),
  documentStorageConsent: z.enum(['on', 'true'])
});

export function emptyToNull(value?: string | null) {
  if (!value || value.trim() === '') return null;
  return value.trim();
}

export function optionalDate(value?: string | null) {
  const clean = emptyToNull(value);
  if (!clean) return null;
  const date = new Date(clean);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
