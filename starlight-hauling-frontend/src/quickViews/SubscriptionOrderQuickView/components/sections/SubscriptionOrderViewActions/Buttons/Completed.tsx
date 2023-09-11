import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { groupBy } from 'lodash';
import { observer } from 'mobx-react-lite';

import { Protected } from '@root/common';
import RevertOrderStatusModal from '@root/components/modals/RevertOrderStatus/RevertOrderStatus';
import { CustomerSubscriptionParams } from '@root/components/PageLayouts/CustomerSubscriptionLayout/types';
import { BillableItemActionEnum } from '@root/consts';
import { useBoolean, useBusinessContext, useStores } from '@root/hooks';
import { SubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';
import {
  ScheduledOrInProgress,
  SubscriptionOrderStatusEnum,
  SubscriptionWorkOrderStatusEnum,
} from '@root/types';

import { IButtons } from './types';

const Completed: React.FC<IButtons> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const { subscriptionOrderStore, subscriptionWorkOrderStore } = useStores();
  const [isUncompleteOrderModalOpen, openUncompleteOrderModal, closeUncompleteOrderModal] =
    useBoolean();
  const { businessUnitId } = useBusinessContext();
  const { customerId } = useParams<CustomerSubscriptionParams>();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity!;
  const isCompletedSubscriptionOrder =
    subscriptionOrder.status === SubscriptionOrderStatusEnum.completed;
  const isNonService =
    !subscriptionOrder.billableService ||
    subscriptionOrder.billableService?.action === BillableItemActionEnum.nonService ||
    Boolean(subscriptionOrder.thirdPartyHaulerId);
  const workOrders: SubscriptionWorkOrder[] =
    subscriptionWorkOrderStore.valuesBySubscriptionOrderId(subscriptionOrder.id);

  const toStatus: ScheduledOrInProgress[] = useMemo(() => {
    const statuses: ScheduledOrInProgress[] = [];

    if (!workOrders.length) {
      return statuses;
    }

    const groupedWorkOrders = groupBy(workOrders, 'status');

    if (
      groupedWorkOrders[SubscriptionWorkOrderStatusEnum.completed] &&
      !groupedWorkOrders[SubscriptionWorkOrderStatusEnum.scheduled] &&
      !groupedWorkOrders[SubscriptionWorkOrderStatusEnum.inProgress]
    ) {
      return statuses;
    }

    if (groupedWorkOrders[SubscriptionWorkOrderStatusEnum.scheduled]) {
      statuses.push('scheduled');
    }

    statuses.push('inProgress');
    return statuses;
  }, [workOrders]);

  const handleUncomplete = useCallback(
    async data => {
      await subscriptionOrderStore.uncomplete({
        data,
        businessUnitId,
        id: subscriptionOrder.id,
        refreshCount: !customerId,
        sequenceId: subscriptionOrder.sequenceId,
      });

      subscriptionOrderStore.closeEdit();
      closeUncompleteOrderModal();
    },
    [
      subscriptionOrderStore,
      businessUnitId,
      subscriptionOrder,
      customerId,
      closeUncompleteOrderModal,
    ],
  );

  const handleApprove = useCallback(() => {
    onSubmit(subscriptionOrderId =>
      subscriptionOrderStore.openCompletionDetails(subscriptionOrderId, true),
    );
  }, [onSubmit, subscriptionOrderStore]);

  return (
    <>
      <RevertOrderStatusModal
        isOpen={isUncompleteOrderModalOpen}
        onFormSubmit={handleUncomplete}
        onClose={closeUncompleteOrderModal}
        status="completed"
        toStatus={toStatus}
      />
      <Protected permissions="orders:uncomplete:perform">
        {!isNonService ? (
          <Button
            variant="alternative"
            disabled={!toStatus.length}
            onClick={openUncompleteOrderModal}
          >
            {t(`Text.Uncomplete`)}
          </Button>
        ) : null}
      </Protected>
      {isCompletedSubscriptionOrder ? (
        <Protected permissions="orders:approve:perform">
          <Layouts.Margin left="3">
            <Button variant="primary" onClick={handleApprove}>
              {t(`Text.Approve`)}
            </Button>
          </Layouts.Margin>
        </Protected>
      ) : null}
    </>
  );
};

export default observer(Completed);
