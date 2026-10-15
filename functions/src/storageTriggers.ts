import { onObjectFinalized } from 'firebase-functions/v2/storage';

export const onMediaUploadFinalized = onObjectFinalized(async (event) => {
  const file = event.data;
  if (!file) return;

  const contentType = file.contentType;
  const filePath = file.name;
  const size = file.size;

  // Log uploaded media metadata for audit/moderation
  console.log(`[Storage] Upload finalized: ${filePath} (${contentType}, ${size} bytes)`);
});
