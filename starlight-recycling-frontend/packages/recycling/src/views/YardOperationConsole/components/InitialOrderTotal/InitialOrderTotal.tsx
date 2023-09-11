import React from 'react';
import { useField } from 'react-final-form';
import { useTranslation } from '../../../../i18n';
import { Box } from '@material-ui/core';

export const InitialOrderTotal = () => {
  const [t] = useTranslation();
  const {
    input: { value: initialOrderTotal },
  } = useField('initialOrderTotal', { subscription: { value: true } });

  return (
    <Box display="flex" justifyContent={'space-between'} mt={2}>
      <span>{t('Initial Order Total, $t(currency)')}</span>
      <span>{t('{{value, number}}', { value: initialOrderTotal })}</span>
    </Box>
  );
};
