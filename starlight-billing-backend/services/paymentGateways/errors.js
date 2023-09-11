import ApplicationError from '../../errors/ApplicationError.js';

export class CvvValidationError extends Error {
  constructor(cvvResponseCode) {
    super(`Cvv validation failed with cvv response code: ${cvvResponseCode}`);
  }
}

export class AvsValidationError extends Error {
  constructor(avsResponseCode) {
    super(`Avs validation failed with avs response code: ${avsResponseCode}`);
  }
}

export class FluidPayTransactionRejectionError extends Error {
  constructor(code) {
    super(`Fluidpay rejected transaction. Code: ${code}`);
  }
}

export class CardConnectTransactionRejectionError extends Error {
  constructor({ respstat, respproc, respcode } = {}) {
    super(
      `Cardconnect rejected transaction. Respstat: ${respstat}, respproc: ${respproc}, respcode: ${respcode}`,
    );
  }
}

export class TransactionNotSettledError extends Error {
  constructor() {
    super('Transaction is not settled yet and cannot be partially refunded');
  }
}

export class UnexpectedResponseError extends Error {
  constructor() {
    super('Expected data from payment gateway is missing or has unexpected value');
  }
}

export const mapGatewayToApplicationError = error => {
  let applicationError;
  if (error instanceof CvvValidationError) {
    applicationError = ApplicationError.invalidRequest('CVV validation failed');
  } else if (error instanceof AvsValidationError) {
    applicationError = ApplicationError.invalidRequest('AVS validation failed');
  } else if (
    error instanceof CardConnectTransactionRejectionError ||
    error instanceof FluidPayTransactionRejectionError
  ) {
    applicationError = ApplicationError.invalidRequest('Operation rejected by payment gateway');
  } else if (error instanceof UnexpectedResponseError) {
    applicationError = ApplicationError.invalidRequest(error.message);
  } else if (error instanceof TransactionNotSettledError) {
    applicationError = ApplicationError.preconditionFailed(error.message);
  } else if (error?.response?.status === 400 && error?.response?.data?.msg) {
    applicationError = ApplicationError.invalidRequest(error.response.data.msg);
  } else {
    applicationError = ApplicationError.unknown(
      'Unknown rejection during operations with payment gateway',
    );
  }

  return applicationError;
};
