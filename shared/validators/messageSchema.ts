import { z } from 'zod';

export const sendMessageSchema = z.object({
  kind: z.enum([
    'text',
    'image',
    'video',
    'audio',
    'document',
    'location',
    'contact',
    'payment',
    'gif',
    'system',
  ]),
  text: z.string().max(8000).optional().nullable(),
  attachment: z.object({
    url: z.string(),
    name: z.string(),
    size: z.number(),
    kind: z.enum(['image', 'video', 'audio', 'document']),
    mimeType: z.string(),
    duration: z.number().optional(),
    thumbnailUrl: z.string().optional(),
  }).optional().nullable(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
    label: z.string().optional(),
  }).optional().nullable(),
  contact: z.object({
    name: z.string(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
  }).optional().nullable(),
  payment: z.object({
    id: z.string(),
    amount: z.number(),
    currency: z.string(),
    recipientId: z.string().optional(),
    recipientName: z.string().optional(),
    status: z.enum(['pending', 'completed', 'failed', 'cancelled']),
    note: z.string().optional(),
  }).optional().nullable(),
  replyTo: z.object({
    id: z.string(),
    senderId: z.string(),
    senderName: z.string(),
    text: z.string().nullable().optional(),
    kind: z.string(),
  }).optional().nullable(),
  expiresInMs: z.number().optional().nullable(),
});

export const editMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(8000),
});
