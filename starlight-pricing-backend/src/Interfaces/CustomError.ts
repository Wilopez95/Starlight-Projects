import codes from '../consts/codesError';

export interface ICustomErrorResponseData {
  code?: codes;
}

export interface ICustomErrorBodyError {
  root_cause?: string[];
  type?: string;
}
export interface ICustomErrorBody {
  error?: ICustomErrorBodyError;
}
export interface ICustomErrorResponse {
  data?: ICustomErrorResponseData;
  status?: number;
}
export interface ICustomError {
  response?: ICustomErrorResponse;
  details?: string;
  message?: string;
  type?: string;
  body?: ICustomErrorBody;
}

export interface IBasicCustomError {
  details?: string;
  message: string;
}
