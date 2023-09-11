import type { ResponseError } from './types';

export class ApiError extends Error {
  response: ResponseError;
  statusCode: number;

  constructor(response: ResponseError, code: number) {
    super(response.message);

    this.response = response;
    this.statusCode = code;
  }

  get isPreconditionFailed(): boolean {
    return this.statusCode === 412;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }
}
