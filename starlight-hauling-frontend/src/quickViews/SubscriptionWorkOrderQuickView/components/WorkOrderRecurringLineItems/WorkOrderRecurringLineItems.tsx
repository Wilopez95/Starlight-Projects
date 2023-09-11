import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { DetailColumnItem } from '@root/pages/CustomerSubscriptionDetails/components';

import { LineItemsHeader } from './components/LineItemsHeader/LineItemsHeader';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.WorkOrderRecurringLineItems.';

const WorkOrderRecurringLineItems: React.FC<{
  subscriptionId: number;
  subscriptionServiceItemId: number;
  isWorkOrderView?: boolean;
  oneTime?: boolean;
}> = ({ subscriptionId, subscriptionServiceItemId, isWorkOrderView = false, oneTime = false }) => {
  const { t } = useTranslation();
  const { subscriptionStore, subscriptionWorkOrderStore } = useStores();

  useEffect(() => {
    subscriptionStore.requestSubscriptionServices(subscriptionId);
  }, [subscriptionStore, subscriptionId]);

  const subscriptionOrderServices = useMemo(
    () =>
      subscriptionStore.services.filter(item => {
        return item.lineItems.find(
          el => el.subscriptionServiceItemId === subscriptionServiceItemId,
        );
      }),
    [subscriptionStore.services, subscriptionServiceItemId],
  );

  const currentWorkOrder = subscriptionWorkOrderStore.selectedEntity;
  const workOrders = subscriptionWorkOrderStore.values;
  const workOrderIndex = workOrders.findIndex(item => item.id === currentWorkOrder?.id) + 1;

  return (
    <>
      {subscriptionOrderServices?.map((service, index) => {
        return (
          <>
            {service.lineItems.find(item => workOrderIndex <= item.quantity) ? (
              <Divider both />
            ) : null}
            <Layouts.Margin bottom="2" key={index}>
              <Layouts.Box width="90%">
                <Layouts.Flex as={Layouts.Margin} justifyContent="space-between">
                  <Layouts.Flex as={Layouts.Margin} right="3">
                    <Layouts.Box width="500px">
                      {service.lineItems.map((lineItem, value) => {
                        return (
                          workOrderIndex <= lineItem.quantity && (
                            <>
                              {value === 0 ? <LineItemsHeader /> : null}
                              <Layouts.Flex justifyContent="space-between" key={value}>
                                <DetailColumnItem>
                                  {lineItem.billableLineItem?.description}
                                </DetailColumnItem>
                                <DetailColumnItem>
                                  {startCase(lineItem.billableLineItem?.unit)}
                                </DetailColumnItem>
                              </Layouts.Flex>
                            </>
                          )
                        );
                      })}
                    </Layouts.Box>
                  </Layouts.Flex>
                  {!isWorkOrderView && !oneTime ? (
                    <Layouts.Flex justifyContent="flex-end">
                      <Layouts.Box>
                        {service.lineItems.map((lineItem, value) => {
                          return workOrderIndex <= lineItem.quantity ? (
                            <>
                              {value === 0 ? (
                                <Layouts.Flex justifyContent="flex-end">
                                  <Layouts.Box>
                                    <DetailColumnItem
                                      label={t(`${I18N_PATH}qty`)}
                                      textTransform="uppercase"
                                      variant="bodySmall"
                                    />
                                  </Layouts.Box>
                                </Layouts.Flex>
                              ) : null}
                              <DetailColumnItem key={value}>{lineItem.quantity}</DetailColumnItem>
                            </>
                          ) : null;
                        })}
                      </Layouts.Box>
                    </Layouts.Flex>
                  ) : null}
                </Layouts.Flex>
              </Layouts.Box>
            </Layouts.Margin>
          </>
        );
      })}
    </>
  );
};

export default observer(WorkOrderRecurringLineItems);
