import { z } from 'zod';

export const updateUserProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters').max(60).optional(),
  photoURL: z.string().url('Invalid photo URL').optional().nullable(),
  about: z.string().trim().max(160, 'Status/About cannot exceed 160 characters').optional(),
  phoneNumber: z.string().trim().max(25).optional(),
});
