export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  status?: string;
  about?: string;
  phoneNumber?: string;
  isOnline?: boolean;
  lastSeen?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface UserProfileUpdate {
  displayName?: string;
  photoURL?: string | null;
  about?: string;
  phoneNumber?: string;
}
