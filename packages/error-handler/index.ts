export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational?: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational?: true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);

    // this.stack = new Error().stack ;
  }
}

// not found error
export class AppNotFoundError extends AppError {
  constructor(message = 'resources not found') {
    super(message, 404, true);
  }
}

// validation error
export class AppValidationError extends AppError {
  constructor(message = 'app validation failed', details?: any) {
    super(message, 400, true, details);
  }
}

export class AppAuthenticationError extends AppError {
  constructor(message = 'app authentication failed') {
    super(message, 401);
  }
}

export class AppAuthorizationError extends AppError {
  constructor(message = 'app authorization failed') {
    super(message, 401);
  }
}

export class AppForbiddenAccessError extends AppError {
  constructor(message = 'app forbids you to send anything') {
    super(message, 403);
  }
}

export class AppDatabaseError extends AppError {
  constructor(message = 'app database error ', details?: any) {
    super(message, 403, true, details);
  }
}

export class AppRateLimitError extends AppError {
  constructor(message = 'Too many requests try again') {
    super(message, 429);
  }
}
