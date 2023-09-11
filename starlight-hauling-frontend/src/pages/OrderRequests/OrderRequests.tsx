import React, { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { SubscriptionIcon } from '@root/assets';
import { Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { CustomerStatus, Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import * as Styles from './styles';

const I18N_PATH = 'pages.OrderRequests.';

const OrderRequestsPage: React.FC = () => {
  const { orderRequestStore } = useStores();
  const { dateFormat, formatCurrency, formatDateTime, currencySymbol } = useIntl();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();

  const { format } = useTimeZone();
  const { t } = useTranslation();

  useCleanup(orderRequestStore, 'id', 'desc');

  const handleRequest = useCallback(() => {
    orderRequestStore.getOrderRequests(businessUnitId);
  }, [orderRequestStore, businessUnitId]);

  const handleCheckUpdates = useCallback(() => {
    orderRequestStore.cleanup();
    orderRequestStore.getOrderRequests(businessUnitId);
  }, [businessUnitId, orderRequestStore]);

  useEffect(handleRequest, [handleRequest]);

  const loading = orderRequestStore.loading;
  const loaded = orderRequestStore.loaded;

  return (
    <>
      <Helmet title={t('Titles.OrderRequests')} />
      <Styles.OrderRequestsPageContainer>
        <Layouts.Flex justifyContent="space-between">
          <Layouts.Margin bottom="2">
            <Layouts.Box height="100%" maxHeight="50px">
              <Typography as="h1" variant="headerTwo">
                Order Requests
              </Typography>
            </Layouts.Box>
          </Layouts.Margin>
          <Button iconLeft={SubscriptionIcon} variant="converseAlert" onClick={handleCheckUpdates}>
            {t(`${I18N_PATH}Text.CheckForUpdates`)}
          </Button>
        </Layouts.Flex>
        <TableTools.ScrollContainer>
          <Table>
            <TableTools.Header>
              <TableTools.HeaderCell>{t('Text.CreateDate')}</TableTools.HeaderCell>

              <TableTools.SortableHeaderCell
                store={orderRequestStore}
                onSort={handleRequest}
                sortKey="customer"
              >
                {t('Text.Customer')}
              </TableTools.SortableHeaderCell>
              <TableTools.SortableHeaderCell
                store={orderRequestStore}
                onSort={handleRequest}
                sortKey="jobSite"
              >
                {t('Text.JobSite')}
              </TableTools.SortableHeaderCell>
              <TableTools.SortableHeaderCell
                store={orderRequestStore}
                onSort={handleRequest}
                sortKey="service"
              >
                {t('Text.Service')}
              </TableTools.SortableHeaderCell>

              <TableTools.HeaderCell minWidth={100}>{t('Text.ServiceDate')}</TableTools.HeaderCell>

              <TableTools.SortableHeaderCell
                store={orderRequestStore}
                onSort={handleRequest}
                sortKey="total"
                right
                minWidth={100}
              >
                {t('Text.TotalP', { currencySymbol })}
              </TableTools.SortableHeaderCell>
            </TableTools.Header>
            <TableBody
              loading={orderRequestStore.loading}
              noResult={orderRequestStore.noResult}
              cells={6}
            >
              {orderRequestStore.values.map(order => (
                <TableRow
                  key={order.id}
                  onClick={() => {
                    if (order.customer.status !== CustomerStatus.inactive) {
                      history.push(
                        pathToUrl(Paths.RequestModule.OrderRequest.Edit, {
                          businessUnit: businessUnitId,
                          orderRequestId: order.id,
                        }),
                      );
                    }
                  }}
                >
                  <TableCell>
                    <Typography disabled={order.customer.status === CustomerStatus.inactive}>
                      {format(order.createdAt as Date, dateFormat.dateTime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography disabled={order.customer.status === CustomerStatus.inactive}>
                      {order.customer?.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography disabled={order.customer.status === CustomerStatus.inactive}>
                      {order.jobSiteShortAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Layouts.Flex alignItems="center">
                      {order.billableServiceQuantity > 1 ? (
                        <>
                          <Typography disabled={order.customer.status === CustomerStatus.inactive}>
                            {order.billableServiceQuantity}
                          </Typography>
                          <Typography
                            color="secondary"
                            shade="desaturated"
                            disabled={order.customer.status === CustomerStatus.inactive}
                          >
                            <Layouts.Margin left="0.5" right="0.5">
                              x
                            </Layouts.Margin>
                          </Typography>
                        </>
                      ) : null}
                      <Typography disabled={order.customer.status === CustomerStatus.inactive}>
                        {order.billableServiceDescription}
                      </Typography>
                    </Layouts.Flex>
                  </TableCell>
                  <TableCell>
                    <Typography disabled={order.customer.status === CustomerStatus.inactive}>
                      {formatDateTime(order.serviceDate).date}{' '}
                    </Typography>
                  </TableCell>
                  <TableCell right>
                    <Typography
                      fontWeight="bold"
                      disabled={order.customer.status === CustomerStatus.inactive}
                    >
                      {formatCurrency(order.grandTotal)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TableInfiniteScroll onLoaderReached={handleRequest} loaded={loaded} loading={loading}>
            {t(`${I18N_PATH}Text.LoadingOrderRequests`)}
          </TableInfiniteScroll>
        </TableTools.ScrollContainer>
      </Styles.OrderRequestsPageContainer>
    </>
  );
};

export default observer(OrderRequestsPage);
