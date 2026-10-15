import { MAX_FILE_SIZE } from './constants';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File, maxSize: number = MAX_FILE_SIZE): FileValidationResult {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size (${Math.round(maxSize / (1024 * 1024))}MB)`,
    };
  }
  return { valid: true };
}
