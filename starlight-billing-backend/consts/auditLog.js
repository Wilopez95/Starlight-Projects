export const AUDIT_LOG_ACTION = {
  create: 'create',
  modify: 'modify',
  delete: 'delete',
};

export const AUDIT_LOG_ENTITY = {
  payouts: 'Payout',
  payments: 'Payment',
  // fake payments since not table refs in db
  creditMemo: 'CreditMemo',
  writeOff: 'WriteOff',
  // refundOnAccount: 'RefundOnAccount', // Payment
  reversal: 'ReversedPayment',

  invoices: 'Invoice',
  creditCards: 'CreditCard',
  batchStatements: 'BatchStatement',
  statements: 'Statement',
  settlements: 'Settlement',
  bankDeposits: 'BankDeposit',
};
