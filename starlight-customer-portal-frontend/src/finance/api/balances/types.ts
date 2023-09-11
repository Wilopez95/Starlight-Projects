export interface IResponseBalances {
  customerBalances: {
    balance: number;
    creditLimit: number;
    nonInvoicedTotal: number;
    prepaidOnAccount: number;
    prepaidDeposits: number;
    paymentDue: number;
  };
}
