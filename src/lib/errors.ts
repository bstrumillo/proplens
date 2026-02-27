/**
 * Custom error classes for structured error handling across the application.
 */

export class AuthorizationError extends Error {
  constructor(message = "You are not authorized to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  public readonly resource: string;

  constructor(resource = "Resource", id?: string) {
    const message = id
      ? `${resource} with ID "${id}" was not found`
      : `${resource} was not found`;
    super(message);
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

export class ValidationError extends Error {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message = "Validation failed",
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}
