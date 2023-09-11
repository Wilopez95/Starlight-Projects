import i18next from 'i18next';
import * as Yup from 'yup';

import { ONLY_NUMBERS_AND_LETTERS } from '@root/consts';

import { priceValidator } from '../../../../../../../helpers';
import { type IOverpaidOrder } from '../../../../../../../types';
import { RefundPrepaidOrderPayment } from '../../../../../Payments/types';
import { type FormikCustomerWithInvoiceDrafts } from '../../types';

const defaultValue = {
  refundType: 'CHECK' as const,
  date: new Date(),
  amount: 0,
};

export const generateValidationSchema = (overpaidOrders: IOverpaidOrder[]) =>
  Yup.object().shape({
    refundType: Yup.string().required('Payment type is required'),
    checkNumber: Yup.string()
      .nullable()
      .when('refundType', {
        is: 'CHECK',
        then: Yup.string()
          .matches(ONLY_NUMBERS_AND_LETTERS, 'Please, use only numbers or letters')
          .required('Check is required'),
      }),
    orderId: Yup.number().positive(),
    amount: Yup.number()
      .typeError('Must be numeric')
      .required('Amount is required')
      .positive('Amount must be positive')
      .test('amount', i18next.t('ValidationErrors.IncorrectAmountFormat'), priceValidator)
      .test(
        'overpaidAmount',
        'Amount cannot be larger than total unutilized amount',
        function (amount) {
          const currentOrderId = this.parent?.orderId as number;
          const currentOrder = overpaidOrders.find(order => order.id === currentOrderId);

          if (currentOrder && amount) {
            return amount <= currentOrder.overpaidAmount;
          }

          return true;
        },
      )
      .test(
        'paymentAmount',
        'Amount cannot be larger than payment unutilized amount',
        function (amount) {
          const { orderId, refundedPaymentId } = this.parent;
          const currentOrder = overpaidOrders.find(order => order.id === (orderId as number));

          if (currentOrder && amount) {
            const payment = currentOrder.payments.find(
              paymentInfo => paymentInfo.id === refundedPaymentId,
            );

            if (payment) {
              return amount <= Number(payment.amount);
            }
          }

          return true;
        },
      ),
  });

export const getValues = (
  currentCustomer: FormikCustomerWithInvoiceDrafts,
): RefundPrepaidOrderPayment => {
  const order = currentCustomer.overpaidOrders[Object.keys(currentCustomer.overpaidOrders)[0]];
  const payment = order.payments.find(paymentInfo => Number(paymentInfo.amount) > 0);

  return {
    ...defaultValue,
    orderId: order.id,
    refundedPaymentId: payment?.id ?? 0,
    refundType: payment?.paymentType === 'creditCard' ? 'CREDIT_CARD' : 'CHECK',
  };
};
