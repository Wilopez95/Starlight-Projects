import React, { useMemo } from 'react';
import { Trans } from '../../../i18n';
import { SelectOption, TextField } from '@starlightpro/common';
import { useField } from 'react-final-form';
import { PaymentMethodType } from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';
import { usePlaceNewOrdersOnAccountAllowed } from '../hooks/usePlaceNewOrdersOnAccountAllowed';
import { isObject } from 'lodash-es';

interface Props extends ReadOnlyOrderFormComponent {}

export const PaymentMethodInput: React.FC<Props> = ({ readOnly }) => {
  const {
    input: { value: customer },
  } = useField('customer');
  const isOnAccountAllowed = usePlaceNewOrdersOnAccountAllowed();
  const showOnAccount = useMemo(
    () => customer?.onAccount && ((customer?.onHold && isOnAccountAllowed) || !customer?.onHold),
    [customer?.onAccount, customer?.onHold, isOnAccountAllowed],
  );

  return (
    <TextField
      disabled={readOnly || !isObject(customer)}
      select
      name="paymentMethod"
      fullWidth
      required={!readOnly}
      label={<Trans>Payment Method</Trans>}
    >
      {showOnAccount && (
        <SelectOption value={PaymentMethodType.OnAccount}>
          <Trans>On Account</Trans>
        </SelectOption>
      )}
      <SelectOption value={PaymentMethodType.Cash}>
        <Trans>Cash</Trans>
      </SelectOption>
      <SelectOption value={PaymentMethodType.Check}>
        <Trans>Check</Trans>
      </SelectOption>
      <SelectOption value={PaymentMethodType.CreditCard}>
        <Trans>Credit Card</Trans>
      </SelectOption>
    </TextField>
  );
};
