import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { QuickView } from '@root/quickViews';
import { IWorkOrder, IndependentOrderStatus, SubscriptionOrderStatus } from '@root/types';
import { UnableToEditWO } from '@root/widgets/modals';

import { EditQuickView } from '../EditQuickView';

import { Form } from './Form';
import { IDetailsQuickView } from './types';

export const DetailsQuickView: React.FC<IDetailsQuickView> = observer(({ mainContainerRef }) => {
  const { id } = useParams<{
    id: string;
  }>();

  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const { workOrdersStore, subscriptionOrderStore, independentOrderStore } = useStores();
  const [invalidToEditWOs, setInvalidToEditWOs] = useState<number | number[] | null>(null);

  const workOrderStored = workOrdersStore.workOrdersByDisplayId.get(id);

  const [workOrder, setWorkOrder] = useState<IWorkOrder | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      if (workOrderStored) {
        setWorkOrder(workOrderStored);
      }

      if (!workOrderStored) {
        workOrdersStore.toggleQuickViewLoading();

        const fetchedRoute = await workOrdersStore.fetchWorkOrderById(id);

        if (fetchedRoute) {
          setWorkOrder(fetchedRoute);
        }

        workOrdersStore.toggleQuickViewLoading();
      }
    };

    load();
  }, [workOrdersStore, workOrderStored, id]);

  const onClose = useCallback(() => {
    const route = pathToUrl(Paths.DispatchModule.WorkOrders, {
      businessUnit: businessUnitId,
    });

    history.push(route);
  }, [businessUnitId, history]);

  const onEdit = useCallback(async () => {
    if (!workOrder) {
      return;
    }

    const invoicedStatus = workOrder.isIndependent
      ? IndependentOrderStatus.Invoiced
      : SubscriptionOrderStatus.Invoiced;

    const status = await (workOrder.isIndependent
      ? independentOrderStore.getIndependentOrderStatus(workOrder.orderId)
      : subscriptionOrderStore.getSubscriptionOrderStatus(workOrder.orderId));

    if (status === invoicedStatus) {
      setInvalidToEditWOs(workOrder.orderId);

      return;
    }

    workOrdersStore.toggleWorkOrderEditQuickViewVisible(true);
  }, [workOrder, independentOrderStore, subscriptionOrderStore, workOrdersStore]);

  const onEditErrorModalClose = useCallback(() => {
    setInvalidToEditWOs(null);
  }, [setInvalidToEditWOs]);

  const onEditQuickViewClose = useCallback(
    (editedWorkOrder?: IWorkOrder) => {
      workOrdersStore.toggleWorkOrderEditQuickViewVisible(false);

      if (editedWorkOrder) {
        setWorkOrder(editedWorkOrder);
      }
    },
    [workOrdersStore],
  );

  return (
    <>
      <UnableToEditWO ids={invalidToEditWOs} onContinue={onEditErrorModalClose} />
      <QuickView
        condition
        parentRef={mainContainerRef}
        isAnimated={false}
        loading={workOrdersStore.quickViewLoading}
        error={!workOrder}
        clickOutHandler={onClose}
        clickOutSelectors={['#edit-quickview']}
      >
        {({ onAddRef, scrollContainerHeight }) => {
          if (workOrder) {
            return (
              <Form
                info={workOrder}
                scrollContainerHeight={scrollContainerHeight}
                onAddRef={onAddRef}
                onClose={onClose}
                onEdit={onEdit}
              />
            );
          }

          return null;
        }}
      </QuickView>
      {workOrder && (
        <EditQuickView
          mainContainerRef={mainContainerRef}
          onClose={onEditQuickViewClose}
          workOrder={workOrder}
        />
      )}
    </>
  );
});
