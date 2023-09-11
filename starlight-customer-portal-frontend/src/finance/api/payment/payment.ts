import { omit } from 'lodash-es';

import { GraphqlVariables, PaymentTypeEnum } from '@root/core/api/base';
import { AppliedFilterState } from '@root/core/common/TableTools/TableFilter';
import { paymentQueries } from '@root/finance/graphql';
import { NewUnappliedPayment, PaymentApplication } from '@root/finance/types/entities';

const castUnappliedPaymentToSend = (data: NewUnappliedPayment) =>
  omit(
    {
      ...data,
      paymentType: PaymentTypeEnum[data.paymentType],
      amount: Number(data.amount),
    },
    [
      'invoicedStatus',
      'prevBalance',
      'newBalance',
      'appliedAmount',
      'unappliedAmount',
      'invoices',
      'writeOffNote',
      'refundedAmount',
      'refundedOnAccountAmount',
    ],
  );

export class PaymentService {
  getPayments(
    variables: GraphqlVariables & {
      customerId?: number;
      businessUnitId?: number;
      filters?: AppliedFilterState;
    },
  ) {
    return paymentQueries.getPayments(variables);
  }

  async createUnappliedPayment(customerId: number, data: NewUnappliedPayment) {
    const result = await paymentQueries.createUnappliedPayment(
      customerId,
      castUnappliedPaymentToSend(data),
    );

    return result.createUnappliedPayment;
  }

  applyPaymentManually(paymentId: number, applications: PaymentApplication[]) {
    return paymentQueries.applyPaymentManually(paymentId, applications);
  }
}
