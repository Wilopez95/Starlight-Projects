import React, { useMemo } from 'react';
import { Button } from '@starlightpro/shared-components';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { Protected, Switch, Typography } from '@root/common';
import { usePermission, useStores } from '@root/hooks';
import { RequestOptions } from '@root/stores/order/types';
import { OrderStatusType } from '@root/types';

import styles from '../../css/styles.scss';

interface IOrderPageHeader {
  requestParams: RequestOptions;
  onInvoiceAll(): void;
  onChangeStatus(): void;
  onUnapproveMultiple(): void;
}

const Header: React.FC<IOrderPageHeader> = ({
  onChangeStatus,
  onInvoiceAll,
  onUnapproveMultiple,
  requestParams,
}) => {
  const { orderStore } = useStores();

  const ordersAmount = orderStore.values.length;
  const pageSize = orderStore.getTabSize(requestParams.status, requestParams.mine);

  const checkedOrdersCount = orderStore.checkedOrders.length;
  const showCanceled = orderStore.showCanceled;

  const buttonProps: Partial<Record<OrderStatusType, { text: string; onClick(): void }>> = {
    approved: {
      text: checkedOrdersCount > 0 ? 'Finalize Selected' : 'Finalize All Orders',
      onClick: onChangeStatus,
    },
    completed: {
      text: checkedOrdersCount > 0 ? 'Approve Selected' : 'Approve All Orders',
      onClick: onChangeStatus,
    },
    finalized: { text: 'Invoice All Orders', onClick: onInvoiceAll },
  };

  const canApprove = usePermission('orders:approve:perform');
  const canFinalize = usePermission('orders:finalize:perform');
  const canRunInvoicing = usePermission('billing/invoices/invoicing:invoicing:perform');

  let canPerformCurrentAction: boolean;

  switch (requestParams.status) {
    case 'completed':
      canPerformCurrentAction = canApprove;
      break;
    case 'approved':
      canPerformCurrentAction = canFinalize;
      break;
    case 'finalized':
      canPerformCurrentAction = canRunInvoicing;
      break;
    default:
      canPerformCurrentAction = false;
  }

  const header =
    checkedOrdersCount === 0 ? (
      <>
        <Typography as="h1" className={styles.headerTitle} variant="headerTwo">
          Orders
        </Typography>

        <Typography color="secondary">
          {ordersAmount} of {pageSize}
        </Typography>
      </>
    ) : (
      <Typography as="h1" variant="headerTwo">
        {orderStore.checkedOrders.length} Order(s) selected
      </Typography>
    );

  const tabSpecific = useMemo(() => {
    if (requestParams.status === 'finalized') {
      return (
        <Switch
          onChange={() => orderStore.toggleShowCanceledOrders(requestParams)}
          value={showCanceled}
          labelClass={styles.space}
          id="showCanceled"
          name="showCanceledSwitch"
        >
          Show Canceled
        </Switch>
      );
    }
    if (status === 'approved' && checkedOrdersCount > 0) {
      return (
        <Protected permissions="orders:unapprove:perform">
          <Button
            className={cx(styles.space, styles.unapproveButton)}
            onClick={onUnapproveMultiple}
          >
            Unapprove Selected
          </Button>
        </Protected>
      );
    }
  }, [checkedOrdersCount, onUnapproveMultiple, orderStore, requestParams, showCanceled]);

  const props = buttonProps?.[requestParams.status];

  return (
    <div className={styles.header}>
      <div className={styles.titleContainer}>{header}</div>
      <div
        className={cx(styles.titleContainer, {
          [styles.disabled]: !!orderStore.selectedEntity,
        })}
      >
        {tabSpecific}
        {props && canPerformCurrentAction ? (
          <Button variant="primary" onClick={props.onClick}>
            {props.text}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default observer(Header);
