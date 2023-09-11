import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTranslation } from '../../../../i18n';
import { useField } from 'react-final-form';

export const LineItemsSum = () => {
  const [t] = useTranslation();
  const {
    input: { value: beforeTaxesTotal },
  } = useField('beforeTaxesTotal', { subscription: { value: true } });

  return (
    <Box display="flex" justifyContent="space-between" mt={2}>
      <Typography variant="body2">{t('Billable items, $t(currency)')}</Typography>
      <Typography variant="body2">{t('{{value, number}}', { value: beforeTaxesTotal })}</Typography>
    </Box>
  );
};
