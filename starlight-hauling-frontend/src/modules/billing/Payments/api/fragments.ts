export const PaymentGridFragment = `
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
  bankDepositDate
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

export const DeferredPaymentFragment = `
  id
  status
  date
  amount
  creditCard {
    id
    cardType
    cardNumberLastDigits
  }
  customer {
    id
    name
  }
  deferredUntil,
  orders {
    id
    jobSite {
      id
    }
    serviceDate
  }
`;

export const DetailedPaymentFragment = `
  ${PaymentFragment}
  bankDepositDate
  isEditable
  isPrepay
  paidOutAmount
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
