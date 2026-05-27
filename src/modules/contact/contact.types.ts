export interface CreateContactMessageDto {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  repliedAt: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListResponse {
  data: ContactMessage[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactActionResponse {
  message: string;
  id: string;
  isRead?: boolean;
  repliedAt?: string | null;
}

export type ContactSortField = "createdAt" | "updatedAt" | "fullName" | "email" | "subject" | "isRead";

export type ContactOrder = "ASC" | "DESC";

export interface ContactQueryParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  sortBy?: ContactSortField;
  order?: ContactOrder;
}

export interface ContactApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export type ValidationErrorMap = Record<string, string>;
