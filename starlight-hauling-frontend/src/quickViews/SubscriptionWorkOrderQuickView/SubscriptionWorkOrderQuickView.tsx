import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Badge } from '@root/common';
import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import * as QuickViewStyles from '../styles';
import SubscriptionWorkOrderViewActions from '../SubscriptionOrderQuickView/components/sections/SubscriptionWorkOrderViewActions/SubscriptionWorkOrderViewActions';
import { IQuickView } from '../types';

import WorkOrderTabs from './components/WorkOrderTabs/WorkOrderTabs';

const I18N_PATH = `quickViews.SubscriptionWorkOrderQuickView.Text.`;

const SubscriptionWorkOrderQuickView: React.FC<IQuickView> = ({
  tableContainerRef,
  size = 'full',
}) => {
  const { t } = useTranslation();
  const { subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;

  return (
    <TableQuickView
      parentRef={tableContainerRef}
      clickOutContainers={tableContainerRef}
      store={subscriptionWorkOrderStore}
      size={size}
    >
      {({ onCancel, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => (
        <>
          <div ref={onAddRef} className={tableQuickViewStyles.header}>
            <QuickViewStyles.CrossIcon onClick={() => onCancel} />
            <div className={tableQuickViewStyles.dataContainer}>
              <div className={tableQuickViewStyles.quickViewTitle}>
                {t(`${I18N_PATH}Subscription`)}
                {subscriptionOrder && !subscriptionOrder.oneTime
                  ? ` ${t(`${I18N_PATH}Servicing`)}`
                  : null}
                {` ${t(`${I18N_PATH}WorkOrder`)}`} #{subscriptionWorkOrder?.sequenceId}
              </div>
              <div className={tableQuickViewStyles.quickViewDescription}>
                <Badge borderRadius={2} color={subscriptionWorkOrder?.statusColor}>
                  {subscriptionWorkOrder?.statusLabel}
                </Badge>
              </div>
            </div>
          </div>
          <Divider top />
          <WorkOrderTabs height={scrollContainerHeight - 60} />
          <Divider />
          <Layouts.Padding bottom="3" ref={onAddRef}>
            <SubscriptionWorkOrderViewActions />
          </Layouts.Padding>
        </>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(SubscriptionWorkOrderQuickView));
