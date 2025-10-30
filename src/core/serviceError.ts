const NOT_FOUND = "NOT_FOUND";
const VALIDATION_FAILED = "VALIDATION_FAILED";
const UNAUTHORIZED = "UNAUTHORIZED";
const FORBIDDEN = "FORBIDDEN";
const BAD_REQUEST = "BAD_REQUEST";
const VERIFICATION_REQUIRED = "VERIFICATION_REQUIRED";
const RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";

export class ServiceError extends Error {
  code: string;
  statusCode: number;
  details: Record<string, any>;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details: Record<string, any> = {}
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ServiceError";
  }

  static notFound(
    message: string,
    details?: Record<string, any>
  ): ServiceError {
    return new ServiceError(NOT_FOUND, message, 404, details);
  }

  static validationFailed(
    message: string,
    details?: Record<string, any>
  ): ServiceError {
    return new ServiceError(VALIDATION_FAILED, message, 400, details);
  }

  static unauthorized(
    message: string,
    details?: Record<string, any>
  ): ServiceError {
    return new ServiceError(UNAUTHORIZED, message, 401, details);
  }

  static forbidden(
    message: string,
    details?: Record<string, any>
  ): ServiceError {
    return new ServiceError(FORBIDDEN, message, 403, details);
  }

  static badRequest(
    message: string,
    details?: Record<string, any>
  ): ServiceError {
    return new ServiceError(BAD_REQUEST, message, 400, details);
  }

  static verificationRequired(
    message: string,
    details?: Record<string, any>
  ): ServiceError {
    return new ServiceError(VERIFICATION_REQUIRED, message, 403, details);
  }

  static rateLimitExceeded(
    message: string,
    details?: Record<string, any>
  ): ServiceError {
    return new ServiceError(RATE_LIMIT_EXCEEDED, message, 429, details);
  }

  get isNotFound(): boolean {
    return this.code === NOT_FOUND;
  }

  get isValidationFailed(): boolean {
    return this.code === VALIDATION_FAILED;
  }

  get isUnauthorized(): boolean {
    return this.code === UNAUTHORIZED;
  }

  get isForbidden(): boolean {
    return this.code === FORBIDDEN;
  }

  get isBadRequest(): boolean {
    return this.code === BAD_REQUEST;
  }

  get isVerificationRequired(): boolean {
    return this.code === VERIFICATION_REQUIRED;
  }

  get isRateLimitExceeded(): boolean {
    return this.code === RATE_LIMIT_EXCEEDED;
  }
}

export default ServiceError;
