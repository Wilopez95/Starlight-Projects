import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { Divider, Table, TableRow } from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IWorkOrderTable } from '@root/quickViews/SubscriptionOrderQuickView/types';

import SubscriptionWorkOrderQuickView from '../../../../SubscriptionWorkOrderQuickView/SubscriptionWorkOrderQuickView';

import styles from './css/styles.scss';

const I18N_PATH = `quickViews.SubscriptionOrderQuickView.components.sections.WorkOrdersTable.`;

const WorkOrdersTable: React.FC<IWorkOrderTable> = ({
  subscriptionOrderId,
  oneTime,
  quickView,
}) => {
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const { subscriptionWorkOrderStore, subscriptionOrderStore, subscriptionStore } = useStores();
  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const workOrders = subscriptionWorkOrderStore.valuesBySubscriptionOrderId(subscriptionOrderId);
  const { formatCurrency, formatDateTime } = useIntl();

  useEffect(() => {
    if (subscription?.id && !workOrders.length) {
      subscriptionWorkOrderStore.request({
        subscriptionOrderId,
        subscriptionId: subscription.id,
      });
    }
  }, [subscription?.id, subscriptionWorkOrderStore, workOrders.length, subscriptionOrderId]);

  const workOrdersLineItemsTotal = workOrders.reduce(
    (item, acc) => item + acc.billableLineItemsTotal,
    0,
  );

  return (
    <>
      <Divider both />
      <Layouts.Margin bottom="2">
        <Typography variant="headerThree">
          {oneTime ? t(`${I18N_PATH}WorkOrders`) : t(`${I18N_PATH}ServicingWorkOrders`)}
        </Typography>
      </Layouts.Margin>
      <SubscriptionWorkOrderQuickView
        {...quickView}
        condition={subscriptionWorkOrderStore.isOpenQuickView}
        store={subscriptionWorkOrderStore}
      />
      <Table>
        <th className={cx(styles.headerCell)}>#</th>
        <th className={cx(styles.headerCell)}>{t(`${I18N_PATH}PreferredRoute`)}</th>
        <th className={cx(styles.headerCell)}>{t(`${I18N_PATH}LineItems`)}</th>
        <th className={cx(styles.headerCell)}>{t(`${I18N_PATH}Status`)}</th>
        <th className={cx(styles.headerCell)}>{t(`${I18N_PATH}ServiceDate`)}</th>
        <th className={cx(styles.headerCell, styles.center)}>{t(`${I18N_PATH}Attachments`)}</th>
        <th className={cx(styles.headerCell, styles.center)}>{t(`${I18N_PATH}Instructions`)}</th>
        <th className={cx(styles.headerCell, styles.center)}>{t(`${I18N_PATH}Comment`)}</th>
        <th className={cx(styles.headerCell, styles.right)}>{t(`${I18N_PATH}Total`)}</th>

        {workOrders.map(item => {
          return (
            <TableRow
              key={item.id}
              selected={item.id === subscriptionWorkOrderStore.selectedEntity?.id}
              onClick={() => {
                subscriptionWorkOrderStore.selectEntity(item);
                subscriptionWorkOrderStore.toggleQuickView(true);
              }}
              className={styles.customRow}
            >
              <td>
                <a
                  target="_blank"
                  href={`${process.env
                    .ROUTE_PLANNER_FE_URL!}/business-units/${businessUnitId}/dispatch/work-orders/${
                    item.sequenceId
                  }`}
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  <Typography color="information">{item.sequenceId}</Typography>
                </a>
              </td>
              <td>
                <Typography>{item.assignedRoute}</Typography>
              </td>
              <td>
                <Typography>
                  {item.lineItems.length > 1
                    ? t(`${I18N_PATH}Multiple`)
                    : item.lineItems[0]?.historicalLineItem?.description ?? '-'}
                </Typography>
              </td>
              <td>
                <Typography>
                  <Badge borderRadius={2} color={item.statusColor}>
                    {item.statusLabel}
                  </Badge>
                </Typography>
              </td>
              <td>
                <Typography>{formatDateTime(item.serviceDate).date}</Typography>
              </td>
              <td>
                <Typography textAlign="center">{item.attachMedia ?? '-'}</Typography>
              </td>
              <td>
                <Layouts.Flex justifyContent="center">
                  <Typography>
                    <Checkbox
                      name="instructionsForDriver"
                      value={
                        !!(item.instructionsForDriver ?? subscriptionOrder?.instructionsForDriver)
                      }
                      onChange={noop}
                      disabled
                    />
                  </Typography>
                </Layouts.Flex>
              </td>
              <td>
                <Layouts.Flex justifyContent="center">
                  <Checkbox
                    name="commentsForDriver"
                    value={!!item.commentFromDriver}
                    onChange={noop}
                    disabled
                  />
                </Layouts.Flex>
              </td>
              <td>
                <Typography textAlign="right">
                  {item.lineItems.length ? formatCurrency(item.billableLineItemsTotal) : '-'}
                </Typography>
              </td>
            </TableRow>
          );
        })}
      </Table>
      <Layouts.Flex justifyContent="flex-end">
        <Layouts.Box width="300px">
          <Layouts.Flex justifyContent="space-between">
            <Typography variant="bodyMedium" fontWeight="bold">
              {oneTime
                ? t(`${I18N_PATH}WorkOrdersTotal`)
                : t(`${I18N_PATH}ServicingWorkOrdersTotal`)}
            </Typography>
            <Typography fontWeight="bold">{formatCurrency(workOrdersLineItemsTotal)}</Typography>
          </Layouts.Flex>
        </Layouts.Box>
      </Layouts.Flex>
    </>
  );
};

export default observer(WorkOrdersTable);
