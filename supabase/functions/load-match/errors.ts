export class ResponseException extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export class UnauthorizedException extends ResponseException {
  constructor() {
    super(401, "This method requires authentication");
  }
}

export class BadRequestException extends ResponseException {
  constructor(message: string) {
    super(400, message);
  }
}

export class ConflictException extends ResponseException {
  constructor(message: string) {
    super(409, message);
  }
}
