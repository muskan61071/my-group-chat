export * from './models.js';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
