import React from 'react';
import { ITypographyLayout, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { ICurrency } from '@root/core/components/Currency/types';
import { useIntl } from '@root/core/i18n/useIntl';

const Currency: React.FC<ICurrency & ITypographyLayout> = ({
  alertWhenNegative = false,
  value,
  ...typoProps
}) => {
  const { formatCurrency } = useIntl();

  return (
    <Typography
      textAlign='right'
      shade='dark'
      {...typoProps}
      color={alertWhenNegative && value! < 0 ? 'alert' : 'default'}
    >
      {formatCurrency(value)}
    </Typography>
  );
};

export default observer(Currency);
