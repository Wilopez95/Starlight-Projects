export const PaymentFragment = `
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
  memoNote
  billableItemType
  billableItemId
  creditCard {
    id
    cardType
    cardNumberLastDigits
  }
  deferredUntil
  customer {
    id
    name
  }
`;

export const DetailedPaymentFragment = `
  ${PaymentFragment}
  invoices {
    id
    type
    dueDate
    createdAt
    total
    balance
    amount
    prevBalance
    writeOff
  }
  reverseData {
    note
  }
  refundedAmount
  refundedOnAccountAmount
  originalPaymentId
  writeOffNote
`;
