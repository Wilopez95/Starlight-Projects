export const SettlementFragment = `
  id
  date
  amount
  fees
  adjustments
  count
  pdfUrl
  paymentGateway
  mid
`;

export const SettlementTransactionFragment = `
  amount
  fee
  adjustment
  transactionNote
  payment {
    customer {
      name
      businessUnitId
    }
  }
`;

export const DetailedSettlementFragment = `
  ${SettlementFragment}
  settlementTransactions {
    ${SettlementTransactionFragment}
  }
`;
