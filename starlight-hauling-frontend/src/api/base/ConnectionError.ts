import { type ResponseError } from './types';

export class ConnectionError extends Error {
  response: ResponseError;
  statusCode?: number;

  constructor(response: ResponseError, code?: number) {
    super(response.message);

    this.response = response;
    this.statusCode = code;
  }
}
