import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { FieldArray, useFormikContext } from 'formik';
import { isEmpty, isEqual, pick, tail } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { usePrevious, useStores } from '@root/hooks';

import { SubscriptionOrderStatusEnum } from '@root/types/entities/subscriptionOrder/subscriptionOrder';
import { BillableItemActionEnum } from '@root/consts/billableItem';
import { generateServicePropPath } from '../../../../helpers';
import {
  INewSubscription,
  INewSubscriptionOrder,
  INewSubscriptionService,
  SubscriptionOrderOption,
} from '../../../../types';

import { SubscriptionOrder } from './components/SubscriptionOrder';
import { ISubscriptionOrders } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.ServiceItems.components.SubscriptionOrders.Text.';

export const SubscriptionOrders: React.FC<ISubscriptionOrders> = observer(
  ({
    serviceItem,
    serviceIndex,
    isSubscriptionClosed,
    isSubscriptionDraftEdit,
    finalSubscriptionOrdersQuantity,
    endDate,
    updateSubOrder,
    deleteSubOrder,
  }) => {
    const { t } = useTranslation();

    const { setFieldValue } = useFormikContext<INewSubscription>();

    const prevServiceItem: INewSubscriptionService | undefined = usePrevious(serviceItem);

    const { billableServiceStore } = useStores();

    const resetUnlockOverrides = useCallback(() => {
      const updatedSubscriptionOrders = serviceItem.subscriptionOrders.map(subscriptionOrder => ({
        ...subscriptionOrder,
        unlockOverrides: false,
      }));

      setFieldValue(
        generateServicePropPath({
          serviceIndex,
          property: 'subscriptionOrders',
        }),
        updatedSubscriptionOrders,
      );
    }, [serviceIndex, serviceItem.subscriptionOrders, setFieldValue]);

    useEffect(() => {
      const relatedServiceItemFields: (keyof INewSubscriptionService)[] = ['materialId'];

      if (
        prevServiceItem &&
        !isEqual(
          pick(serviceItem, relatedServiceItemFields),
          pick(prevServiceItem, relatedServiceItemFields),
        )
      ) {
        resetUnlockOverrides();
      }
    }, [prevServiceItem, resetUnlockOverrides, serviceItem]);

    const noFinalInConfiguration = useMemo(() => {
      const services = serviceItem?.subscriptionOrders || [];
      const optionalServices = serviceItem?.optionalSubscriptionOrders || [];
      const subscriptionServiceOrders = services.concat(optionalServices);

      return (
        subscriptionServiceOrders.some(subscriptionOrder => subscriptionOrder.action === 'final') ||
        endDate == undefined
      );
    }, [serviceItem.optionalSubscriptionOrders, serviceItem.subscriptionOrders, endDate]);

    const noDeliveryInConfiguration = serviceItem.subscriptionOrders.some(
      subscriptionOrder => subscriptionOrder.action === 'delivery',
    );

    return (
      <FieldArray
        name={generateServicePropPath({
          serviceIndex,
          property: 'subscriptionOrders',
        })}
      >
        {({
          push,
          remove,
        }: {
          push(obj: INewSubscriptionOrder): void;
          remove(index: number): void;
        }) => (
          <Layouts.Box>
            <Layouts.Padding padding="3" top="1">
              <Layouts.Margin top="2" bottom="1">
                <Typography variant="headerFour">Subscription Orders</Typography>
              </Layouts.Margin>
              {serviceItem.subscriptionOrders.map((subscriptionOrder, subscriptionOrderIndex) => (
                <SubscriptionOrder
                  key={`${subscriptionOrder.billableServiceId}-${subscriptionOrderIndex}`}
                  subscriptionOrder={subscriptionOrder}
                  subscriptionOrderIndex={subscriptionOrderIndex}
                  serviceIndex={serviceIndex}
                  isSubscriptionDraftEdit={isSubscriptionDraftEdit}
                  isSubscriptionClosed={isSubscriptionClosed}
                  onRemove={() => {
                    remove(subscriptionOrderIndex);
                    deleteSubOrder(serviceIndex, subscriptionOrderIndex);

                    if (
                      !serviceItem.billableService?.services?.includes(
                        subscriptionOrder.billableServiceId,
                      )
                    ) {
                      setFieldValue(
                        generateServicePropPath({
                          serviceIndex,
                          property: 'optionalSubscriptionOrders',
                        }),
                        [...serviceItem.optionalSubscriptionOrders, subscriptionOrder],
                      );
                    }
                  }}
                />
              ))}

              {(!serviceItem.isDeleted && !isEmpty(serviceItem.optionalSubscriptionOrders)) ||
              !serviceItem.billableServiceId ||
              !noFinalInConfiguration ||
              !noDeliveryInConfiguration ? (
                <Button
                  variant="none"
                  disabled={
                    (isSubscriptionClosed &&
                      serviceItem.quantity === finalSubscriptionOrdersQuantity) ||
                    !serviceItem.billableServiceId ||
                    (noDeliveryInConfiguration && noFinalInConfiguration)
                  }
                  onClick={async () => {
                    if (serviceItem.optionalSubscriptionOrders?.[0]) {
                      push(serviceItem.optionalSubscriptionOrders?.[0]);
                      setFieldValue(
                        generateServicePropPath({
                          serviceIndex,
                          property: 'optionalSubscriptionOrders',
                        }),
                        tail(serviceItem.optionalSubscriptionOrders),
                      );
                    }

                    if (!noFinalInConfiguration || !noDeliveryInConfiguration) {
                      const equipmentItemIds = [];
                      if (serviceItem.billableService?.equipmentItemId) {
                        equipmentItemIds.push(serviceItem.billableService.equipmentItemId);
                      }
                      const billServices = await billableServiceStore.request({
                        businessLineId: serviceItem.billableService?.businessLineId,
                        equipmentItemIds,
                        activeOnly: true,
                      });

                      if (!noDeliveryInConfiguration && billServices) {
                        const options: SubscriptionOrderOption[] = [];
                        billServices.map(item => {
                          if (item.action == BillableItemActionEnum.delivery) {
                            const option: SubscriptionOrderOption = {
                              action: BillableItemActionEnum.delivery,
                              value: item.id,
                              label: item.description,
                            };
                            options.push(option);
                          }

                          return item;
                        });
                        const newDelivery: INewSubscriptionOrder = {
                          id: 0,
                          billableServiceId: serviceItem.billableServiceId ?? 0,
                          quantity: 1,
                          unlockOverrides: false,
                          price: 0,
                          subscriptionOrderOptions: options,
                          globalRatesServicesId: serviceItem.globalRatesRecurringServicesId,
                          customRatesGroupServicesId: serviceItem.customRatesGroupServicesId,
                          action: BillableItemActionEnum.delivery,
                          //isFinalForService?: true,
                          status: SubscriptionOrderStatusEnum.scheduled,
                          oneTime: true,
                        };
                        updateSubOrder(newDelivery, serviceIndex);
                      }
                      if (!noFinalInConfiguration && billServices) {
                        const options: SubscriptionOrderOption[] = [];
                        billServices.map(item => {
                          if (item.action == BillableItemActionEnum.final) {
                            const option: SubscriptionOrderOption = {
                              action: BillableItemActionEnum.final,
                              value: item.id,
                              label: item.description,
                            };
                            options.push(option);
                          }

                          return item;
                        });
                        const newFinal: INewSubscriptionOrder = {
                          id: 0,
                          billableServiceId: serviceItem.billableServiceId ?? 0,
                          quantity: 1,
                          unlockOverrides: false,
                          price: 0,
                          subscriptionOrderOptions: options,
                          globalRatesServicesId: serviceItem.globalRatesRecurringServicesId,
                          customRatesGroupServicesId: serviceItem.customRatesGroupServicesId,
                          action: BillableItemActionEnum.final,
                          //isFinalForService?: true,
                          status: SubscriptionOrderStatusEnum.scheduled,
                          oneTime: true,
                        };
                        updateSubOrder(newFinal, serviceIndex);
                      }
                    }
                  }}
                >
                  <Typography variant="bodyMedium" cursor="pointer" color="information">
                    + {t(`${I18N_PATH}AddSubscriptionOrder`)}
                  </Typography>
                </Button>
              ) : null}
            </Layouts.Padding>
          </Layouts.Box>
        )}
      </FieldArray>
    );
  },
);
