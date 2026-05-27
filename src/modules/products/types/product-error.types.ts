export interface ValidationErrorItem {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  status: number;
  message: string;
  path?: string;
  timestamp?: string;
  errors?: ValidationErrorItem[];
}
