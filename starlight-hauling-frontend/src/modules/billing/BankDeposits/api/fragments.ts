import { PaymentFragment } from '../../Payments/api/fragments';

export const BankDepositFragment = `
  id
  adjustments
  merchantId
  date
  depositType
  status
  synced
  total
  count
`;

export const DetailedBankDepositFragment = `
  ${BankDepositFragment}
  payments {
    ${PaymentFragment}
    reverseData {
      amount
    }
  }
`;
