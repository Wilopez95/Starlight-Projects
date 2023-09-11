import React, { FC } from 'react';

import { useField } from 'react-final-form';
import { Box, Typography } from '@material-ui/core';
import { useTranslation } from '../../../../i18n';

export interface NewOrderTotalProps {}

export const NewOrderTotal: FC<NewOrderTotalProps> = () => {
  const [t] = useTranslation();
  const {
    input: { value: beforeTaxesTotal },
  } = useField('beforeTaxesTotal', { subscription: { value: true } });

  return (
    <Box display="flex" justifyContent="space-between" mt={2}>
      <Typography variant="body2">{t('New Order Total, $t(currency)')}</Typography>
      <Typography variant="body2">{t('{{value, number}}', { value: beforeTaxesTotal })}</Typography>
    </Box>
  );
};

export default NewOrderTotal;
