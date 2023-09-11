import React from 'react';

import { Box } from '@material-ui/core';

import { SubjectRow } from '../../BaseRows';
import { useTranslation } from '@starlightpro/common/i18n';

export const OrderHistoryInvoiceAddedChanges: React.FC<{ invoiceId: number }> = ({ invoiceId }) => {
  const { t } = useTranslation();

  return (
    <SubjectRow subject="Order">
      {t('Added to Invoice')}
      <Box left="0.5">
        #{invoiceId}
        {/* <Badge color='secondary' shade='desaturated' bgColor='grey' bgShade='light'>
          #{invoiceId}
        </Badge> */}
      </Box>
    </SubjectRow>
  );
};
