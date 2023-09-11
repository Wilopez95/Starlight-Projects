import React, { FC } from 'react';
import { Trans } from '../../i18n';
import { useField } from 'react-final-form';
import Warning from '../Warning';
import { usePlaceNewOrdersOnAccountAllowed } from '../../views/YardOperationConsole/hooks/usePlaceNewOrdersOnAccountAllowed';

export interface CustomerOnHoldWarningProps {}

export const CustomerOnHoldWarning: FC<CustomerOnHoldWarningProps> = () => {
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });
  const isOnAccountAllowed = usePlaceNewOrdersOnAccountAllowed();
  const isWarningHasToBeShown = customer?.onHold && !isOnAccountAllowed;

  if (isWarningHasToBeShown) {
    return (
      <Warning>
        <Trans>
          The Customer is On hold, inform the Driver that an order should be paid either with credit
          card, or cash, or check
        </Trans>
      </Warning>
    );
  }

  return null;
};

export default CustomerOnHoldWarning;
