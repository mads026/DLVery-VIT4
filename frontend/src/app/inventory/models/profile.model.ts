export interface InventoryProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  lastLoginAt: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
