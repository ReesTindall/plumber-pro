export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
  }
}

export const ErrorCodes = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  DB_UNIQUE_VIOLATION: 'DB_UNIQUE_VIOLATION',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  
  BIZ_INVALID_JOB_STATUS: 'BIZ_INVALID_JOB_STATUS',
  BIZ_PAYMENT_FAILED: 'BIZ_PAYMENT_FAILED',
  
  INT_STRIPE_ERROR: 'INT_STRIPE_ERROR',
  INT_TWILIO_ERROR: 'INT_TWILIO_ERROR',
  INT_MAPS_ERROR: 'INT_MAPS_ERROR',
  INT_SQUARE_ERROR: 'INT_SQUARE_ERROR'
} as const;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function handleSupabaseError(error: unknown): AppError {
  const supabaseError = error as { code?: string; message?: string };
  if (supabaseError?.code === '23505') {
    return new AppError(
      ErrorCodes.DB_UNIQUE_VIOLATION,
      'This record already exists',
      409,
      error
    );
  }
  
  if (supabaseError?.code === 'PGRST116') {
    return new AppError(
      ErrorCodes.DB_NOT_FOUND,
      'Record not found',
      404,
      error
    );
  }
  
  return new AppError(
    'UNKNOWN_ERROR',
    supabaseError?.message || 'An unexpected error occurred',
    500,
    error
  );
}

export function createApiResponse<T>(data?: T, error?: AppError): ApiResponse<T> {
  if (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }
  
  return {
    success: true,
    data
  };
}