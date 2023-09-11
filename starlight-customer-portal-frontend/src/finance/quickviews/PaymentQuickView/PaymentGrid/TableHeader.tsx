import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { TableHeadCell, TableHeader } from '@root/core/common/TableTools';

const I18N_PATH = 'modules.finance.components.InvoicePaymentQuickView.';

const TableHeaderPayment = () => {
  const { t } = useTranslation();

  return (
    <TableHeader>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}Date`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          #
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}Status`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}TotalAmount`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}AmountDue`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}Applied`)}
        </Typography>
      </TableHeadCell>
      <TableHeadCell>
        <Typography variant='bodyMedium' color='secondary' shade='light'>
          {t(`${I18N_PATH}NewBalance`)}
        </Typography>
      </TableHeadCell>
    </TableHeader>
  );
};

export default observer(TableHeaderPayment);
