import axios from 'axios';
import HttpStatus from 'http-status';
import { PDF_API_URL, PDF_API_KEY } from '../../config.js';
import { APIError } from '../error/index.js';
import logger from '../logger/index.js';

const IS_TEST = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'ci';

const pdfApi = axios.create({
  baseURL: PDF_API_URL,
  headers: {
    'X-STAR-PDF': PDF_API_KEY,
  },
  validateStatus: status => status < HttpStatus.INTERNAL_SERVER_ERROR,
});

const getPdfErrorMessage = message => `
  Request to generate and get link to s3 of document in pdf format returned an error from PDF API.
  Reason: ${message}.
`;

const getPdfError = (message, status = HttpStatus.INTERNAL_SERVER_ERROR) => {
  const pdfError = new APIError(message, status, false, !IS_TEST);
  return pdfError;
};

export const generatePdf = async payload => {
  let response;
  try {
    response = await pdfApi.post('/generate', { ...payload });
  } catch (error) {
    const message = getPdfErrorMessage(error);
    throw getPdfError(message);
  }

  const status = response && response.status;
  const statusText = response && response.statusText;
  const data = response && response.data;

  if (status === HttpStatus.CREATED) {
    return data;
  }

  let message;
  try {
    message = JSON.stringify(data);
  } catch (error) {
    logger.error(error);
    message = statusText;
  }

  const errorMessage = getPdfErrorMessage(message);
  throw getPdfError(errorMessage, status);
};
