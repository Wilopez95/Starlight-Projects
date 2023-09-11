import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { schema } from '../schema';
import { validate } from '../../../../utils/forms';
import { NonServiceOrderForm } from './NonServiceOrderForm';
import { NonServiceOrderFooter } from './NonServiceOrderFooter';
import { showError, showSuccess } from '../../../../components/Toast';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { NonServiceOrderFormWrapper } from './NonServiceOrderFormWrapper';
import { OrderType, useCreateOrderMutation } from '../../../../graphql/api';
import { setSubmitError } from '../../../../components/FinalForm/SidebarForm/SidebarForm';
import { onSubmitWithErrorHandling } from '@starlightpro/common/utils/forms';
import { useCompleteOrderWithExceededCreditLimitPopup } from '../../hooks/useCompleteOrderWithExceededCreditLimitPopup';
import { paymentFormDecorator } from '../../EditDumpOrder/DumpOrderPaymentForm/paymentFormDecorator';
import { Decorator } from 'final-form';

const initialValues = {
  type: OrderType.NonService,
  billableItems: [],
  beforeTaxesTotal: 0,
  taxTotal: 0,
  grandTotal: 0,
};

export interface NonServiceOrderProps {
  onSubmitted: (values: any) => Promise<void>;
}

export const NonServiceOrder: FC<NonServiceOrderProps> = ({ onSubmitted }) => {
  const [createOrderMutation] = useCreateOrderMutation();
  const completeOrderWithExceededCreditLimitPopup = useCompleteOrderWithExceededCreditLimitPopup();

  const handleSubmit = async (values: any) => {
    try {
      const queryResult = await createOrderMutation({
        variables: { data: getOrderUpdateInput(values) },
      });
      const id = queryResult.data?.createOrder?.id;

      if (id) {
        await completeOrderWithExceededCreditLimitPopup(id);
      }

      showSuccess(<Trans>Order created successfully!</Trans>);
    } catch (e) {
      showError(<Trans>Could not create order</Trans>);
      // throw empty error to cancel submit
      throw e;
    }
  };

  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmitWithErrorHandling(handleSubmit, onSubmitted)}
      validate={async (values) => validate(values, schema)}
      mutators={{ ...arrayMutators, setSubmitError }}
      decorators={[paymentFormDecorator as Decorator<typeof initialValues>]}
      render={() => (
        <NonServiceOrderFormWrapper footer={<NonServiceOrderFooter />}>
          <NonServiceOrderForm />
        </NonServiceOrderFormWrapper>
      )}
    />
  );
};
