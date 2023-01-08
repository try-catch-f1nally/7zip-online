export type ValidationError = {property: string; message: string};

export class ApiError extends Error {
  public status: number;
  public errors?: ValidationError[];

  constructor(status: number, message: string, errors?: Array<ValidationError>) {
    super(message);
    this.status = status;
    if (errors) {
      this.errors = errors;
    }
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string) {
    super(401, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, errors?: Array<ValidationError>) {
    super(400, message, errors);
  }
}

export class WrongUserIdInTokenError extends ApiError {
  constructor() {
    super(401, 'Invalid token provided');
  }
}
