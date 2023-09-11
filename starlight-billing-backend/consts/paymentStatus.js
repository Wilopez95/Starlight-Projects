export const PaymentStatus = {
  FAILED: 'failed',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  VOIDED: 'voided',
  DEFERRED: 'deferred',
};

export const PAYMENT_STATUSES = Object.values(PaymentStatus);

export const PaymentInvoicedStatus = {
  APPLIED: 'applied',
  REVERSED: 'reversed',
  UNAPPLIED: 'unapplied',
};

export const PAYMENT_INVOICED_STATUSES = Object.values(PaymentInvoicedStatus);
