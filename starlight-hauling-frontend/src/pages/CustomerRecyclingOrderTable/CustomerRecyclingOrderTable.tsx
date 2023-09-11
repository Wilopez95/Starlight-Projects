import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';

import { TableTools } from '@root/common/TableTools';
import RecyclingOrderTable from '@root/components/RecyclingOrders/RecyclingOrderTable';
import { RecyclingOrdersRouteParams } from '@root/components/RecyclingOrders/types';
import { useStores } from '@root/hooks';

import { CustomerNavigation } from '../Customer';

export interface ICustomerRecyclingOrderTable {
  sidePanelContainer?: HTMLElement | null;
}

export const CustomerRecyclingOrderTable: FC<ICustomerRecyclingOrderTable> = ({
  sidePanelContainer,
}) => {
  const match = useRouteMatch<RecyclingOrdersRouteParams>();
  const { customerStore } = useStores();
  const customer = customerStore.selectedEntity;

  const { t } = useTranslation();

  return (
    <>
      <CustomerNavigation />
      <TableTools.ScrollContainer>
        <RecyclingOrderTable
          title={t('Titles.CustomerOrders', {
            customerName: customer?.name ?? '',
          })}
          match={match}
          formContainer={sidePanelContainer}
        />
      </TableTools.ScrollContainer>
    </>
  );
};
