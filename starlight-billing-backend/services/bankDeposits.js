import sum from 'lodash/sum.js';

import { BankDepositType } from '../consts/bankDepositTypes.js';
import { BankDepositStatus } from '../consts/bankDepositStatuses.js';

export const generateCcBankDeposits = async (
  ctx,
  { BankDeposit, Settlement },
  { settlementId, mid },
  { tenantId },
) => {
  const settlement = await Settlement.getWithTransactions(settlementId);

  settlement.settlementTransactions = settlement.settlementTransactions.filter(
    transaction => +transaction.payment?.customer?.businessUnitId === +settlement.businessUnitId,
  );

  const bankDepositsData = {
    businessUnitId: settlement.businessUnitId,
    settlementId,
    adjustments: Number(settlement.adjustments),
    merchantId: mid,
    depositType: BankDepositType.CREDIT_CARD,
    status: BankDepositStatus.LOCKED,
    synced: false,
    date: settlement.date.toUTCString(),
    payments: settlement.settlementTransactions.flatMap(({ payment }) => ({ id: payment.id })),
    count: settlement.settlementTransactions.length,
    total: sum(settlement.settlementTransactions.map(({ amount }) => Number(amount))),
  };

  const bankDeposit = await BankDeposit.createCcBankDeposit(ctx, {
    data: bankDepositsData,
    tenantId,
  });
  return bankDeposit;
};
