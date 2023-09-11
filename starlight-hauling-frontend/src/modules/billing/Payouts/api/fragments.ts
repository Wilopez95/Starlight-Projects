export const PayoutFragment = `
  id
  date
  paymentType
  amount
  checkNumber
  isAch
  prevBalance
  newBalance
  creditCard {
    id
    cardType
    cardNumberLastDigits
  }
  customer {
    id
    name
  }
`;

export const DetailedPayoutFragment = `
  ${PayoutFragment}
  payments {
    id
    status
    isAch
    invoicedStatus
    date
    paymentType
    amount
    sendReceipt
    checkNumber
    prevBalance
    newBalance
    appliedAmount
    unappliedAmount
  }
`;
