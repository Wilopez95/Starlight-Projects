import React, { FC } from 'react';

import { useField } from 'react-final-form';
import FormErrorText from '@starlightpro/common/components/FormErrorText';
import { Trans } from '../../../../i18n';

export interface TruckChangeNotificationProps {}

export const TruckChangeNotification: FC<TruckChangeNotificationProps> = () => {
  const {
    input: { value: customerTruck },
    meta: { initial: initialCustomerTruck },
  } = useField('customerTruck', { subscription: { value: true, initial: true } });
  const {
    input: { value: useTare },
  } = useField('useTare', { subscription: { value: true } });
  const {
    meta: { error: truckTareError },
  } = useField('truckTare', { subscription: { error: true } });
  const {
    meta: { error: canTareError },
  } = useField('canTare', { subscription: { error: true } });

  if (
    useTare &&
    (customerTruck?.id !== initialCustomerTruck?.id || truckTareError || canTareError)
  ) {
    return (
      <FormErrorText
        touched
        error={
          <Trans>The truck is changed. Please, check the tare weight for this truck and Can</Trans>
        }
      />
    );
  }

  return null;
};

export default TruckChangeNotification;
