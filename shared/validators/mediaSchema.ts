import { z } from 'zod';

export const uploadMediaMetaSchema = z.object({
  groupId: z.string().min(1),
  kind: z.enum(['image', 'video', 'audio', 'document']),
});
