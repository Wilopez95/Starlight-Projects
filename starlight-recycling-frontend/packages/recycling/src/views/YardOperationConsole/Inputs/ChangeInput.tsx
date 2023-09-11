import React, { FC } from 'react';

import { useField } from 'react-final-form';
import { Trans, useTranslation } from '../../../i18n';
import TextField from '@starlightpro/common/components/TextField';

export interface ChangeInputProps {}

export const ChangeInput: FC<ChangeInputProps> = () => {
  const [t] = useTranslation();
  const {
    input: { value: amount },
    meta: { valid },
  } = useField('amount', { subscription: { value: true, valid: true } });
  const {
    input: { value: total },
  } = useField('grandTotal', { subscription: { value: true } });

  return (
    <TextField
      value={valid && amount ? t('{{value, number}}', { value: amount - total }) : '0.00'}
      disabled
      type="number"
      label={<Trans>Change, $t(currency)</Trans>}
      fullWidth
    />
  );
};
