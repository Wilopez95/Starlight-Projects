export const enum OrderErrorCodes {
  PaymentRequired = 'PAYMENT_REQUIRED',
  // needed for cases when rate required for action wasn't found
  RatesNotFound = 'NOT_FOUND',
}
