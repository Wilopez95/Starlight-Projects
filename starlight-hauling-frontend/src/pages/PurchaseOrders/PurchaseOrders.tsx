import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { endOfToday, isAfter } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { PlusIcon } from '@root/assets';
import { Badge, Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { useIntl } from '@root/i18n/useIntl';
import { ICustomerPageParams } from '@root/pages/Customer/types';
import { PurchaseOrderQuickView } from '@root/quickViews';
import { useCleanup, useStores } from '@hooks';

import { CustomerNavigation, CustomerStyles } from '../Customer';

const I18N_PATH = 'pages.PurchaseOrders.PurchaseOrders.Text.';
const today = endOfToday();

const PurchaseOrders = () => {
  const { formatDateTime, formatCurrency, currencySymbol } = useIntl();
  const { purchaseOrderStore, businessLineStore } = useStores();
  const { customerId } = useParams<ICustomerPageParams>();
  const { t } = useTranslation();

  const tableRef = useRef<HTMLTableSectionElement>(null);

  const loadMore = useCallback(() => {
    purchaseOrderStore.request({ customerId });
  }, [purchaseOrderStore, customerId]);

  useCleanup(purchaseOrderStore);

  useEffect(() => {
    purchaseOrderStore.cleanup();
    loadMore();
  }, [purchaseOrderStore, loadMore]);

  useEffect(() => {
    businessLineStore.request({ activeOnly: true });
  }, [businessLineStore]);

  const handleCreatePurchaseOrder = useCallback(() => {
    purchaseOrderStore.toggleQuickView(true);
  }, [purchaseOrderStore]);

  const getBusinessLines = useCallback(
    (businessLineIds): string => {
      if (businessLineIds.length > 1) {
        return t(`${I18N_PATH}Multiple`);
      }
      const businessLine = businessLineStore.getById(businessLineIds[0] as number);

      return businessLine?.name ?? '';
    },
    [businessLineStore, t],
  );

  const selectedPurchaseOrder = purchaseOrderStore.selectedEntity;

  return (
    <>
      <CustomerNavigation />
      <PurchaseOrderQuickView
        isOpen={purchaseOrderStore.isOpenQuickView}
        clickOutContainers={tableRef}
      />
      <CustomerStyles.PageContainer>
        <CustomerStyles.TitleContainer>
          <Typography fontWeight="bold" variant="headerTwo">
            {t('Titles.PurchaseOrders')}
          </Typography>
          <Button iconLeft={PlusIcon} variant="primary" onClick={handleCreatePurchaseOrder}>
            {t(`${I18N_PATH}AddPurchaseOrder`)}
          </Button>
        </CustomerStyles.TitleContainer>
        <TableTools.ScrollContainer>
          <Table>
            <TableTools.Header>
              <TableTools.HeaderCell>{t(`Text.Status`)}</TableTools.HeaderCell>
              <TableTools.HeaderCell>{t(`${I18N_PATH}PO`)} #</TableTools.HeaderCell>
              <TableTools.HeaderCell>{t('Titles.LinesOfBusiness')}</TableTools.HeaderCell>
              <TableTools.HeaderCell>{t(`${I18N_PATH}LevelApplied`)}</TableTools.HeaderCell>
              <TableTools.HeaderCell>{t(`${I18N_PATH}EffectiveDate`)}</TableTools.HeaderCell>
              <TableTools.HeaderCell>{t(`${I18N_PATH}ExpirationDate`)}</TableTools.HeaderCell>
              <TableTools.HeaderCell>
                {t(`${I18N_PATH}POAmount`, { currencySymbol })}
              </TableTools.HeaderCell>
            </TableTools.Header>
            <TableBody cells={7} ref={tableRef}>
              {purchaseOrderStore.values.map(order => {
                const isActiveAndExpired =
                  order.active && order.expirationDate && isAfter(today, order.expirationDate);

                return (
                  <TableRow
                    key={order.id}
                    onClick={() => purchaseOrderStore.selectEntity(order)}
                    selected={selectedPurchaseOrder?.id === order.id}
                  >
                    <TableCell>
                      {isActiveAndExpired ? (
                        <Badge color="primary">{t('Text.Expired')}</Badge>
                      ) : (
                        <StatusBadge active={order.active} />
                      )}
                    </TableCell>
                    <TableCell>{order.poNumber}</TableCell>
                    <TableCell>{getBusinessLines(order.businessLineIds)}</TableCell>
                    <TableCell>
                      {order.levelApplied?.map(level => (
                        <Layouts.Margin key={level} right="1">
                          {level}
                        </Layouts.Margin>
                      ))}
                    </TableCell>
                    <TableCell>
                      {order.effectiveDate ? formatDateTime(order.effectiveDate).date : null}
                    </TableCell>
                    <TableCell>
                      {order.expirationDate ? formatDateTime(order.expirationDate).date : null}
                    </TableCell>
                    <TableCell>
                      {order.poAmount ? formatCurrency(Number(order.poAmount)) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={purchaseOrderStore.loaded}
            loading={purchaseOrderStore.loading}
            initialRequest={false}
          >
            {t('Text.Loading')}
          </TableInfiniteScroll>
        </TableTools.ScrollContainer>
      </CustomerStyles.PageContainer>
    </>
  );
};

export default observer(PurchaseOrders);
