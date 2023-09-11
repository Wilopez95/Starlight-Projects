import React, { FC, useCallback } from 'react';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import CheckBoxField from '@starlightpro/common/components/CheckBoxField';
import { useGetWalkUpCustomerQuery } from '../../../graphql/api';

export interface WalkUpCustomerInputProps {
  className?: string;
}

export const WalkUpCustomerInput: FC<WalkUpCustomerInputProps> = ({ className }) => {
  const { input } = useField('customer', { subscription: { value: true } });
  const { data: walkUpCustomerData } = useGetWalkUpCustomerQuery();
  const walkUpCustomer = walkUpCustomerData?.getWalkUpCustomer;

  const onChange = useCallback(
    (event: React.ChangeEvent<{}>, checked: boolean) => {
      input.onChange({
        target: {
          name: 'customer',
          value: checked ? walkUpCustomer : null,
        },
      });
    },
    [input, walkUpCustomer],
  );

  const checked = walkUpCustomer?.id ? input.value?.id === walkUpCustomer?.id : false;

  return (
    <CheckBoxField
      checked={checked}
      name="isWalkUpCustomer"
      label={walkUpCustomer ? walkUpCustomer.businessName : <Trans>Walk-Up Customer</Trans>}
      className={className}
      onChange={onChange}
    />
  );
};
