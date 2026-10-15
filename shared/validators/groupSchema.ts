import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().trim().min(2, 'Group name must be at least 2 characters').max(80, 'Group name cannot exceed 80 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional().default(''),
  imageURL: z.string().url('Invalid image URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']).default('private'),
});

export const updateGroupSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  imageURL: z.string().url().optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']).optional(),
  settings: z.object({
    membersCanPost: z.boolean().optional(),
    membersCanInvite: z.boolean().optional(),
    disappearingDuration: z.number().optional(),
    allowVoiceNotes: z.boolean().optional(),
    allowMediaSharing: z.boolean().optional(),
  }).optional(),
});

export const joinGroupSchema = z.object({
  code: z.string().trim().min(7, 'Invalid invite code').max(20),
});
