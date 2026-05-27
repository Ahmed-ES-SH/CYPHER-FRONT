export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BANNED = "banned",
}

export interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  avatar?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface VerifyEmailDto {
  token: string;
}

export interface UserStats {
  adminsNumber: number;
  verifiedUsersNumber: number;
  unverifiedUsersNumber: number;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  errors?: Array<{ field: string; message: string }>;
}
