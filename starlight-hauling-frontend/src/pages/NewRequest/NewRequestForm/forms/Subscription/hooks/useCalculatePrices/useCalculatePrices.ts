import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import * as Sentry from '@sentry/react';
import { FormikContextType } from 'formik';
import { find, isEmpty, isEqual, pick } from 'lodash-es';
import { useDebounce } from 'use-debounce';

import { SubscriptionService } from '@root/api';
import { Routes } from '@root/consts';
import { NotificationHelper } from '@root/helpers';
import { useBusinessContext, usePrevious, useStores } from '@root/hooks';
import {
  convertCalculationDates,
  convertServiceDaysOfWeek,
} from '@root/stores/subscription/helpers';
import {
  ICalculateSubscriptionPricesConfig,
  ISubscriptionPrices,
  ISubscriptionProration,
  SubscriptionStatusEnum,
} from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { checkIfUpdatedServiceItem, checkIfUpdatedServiceLineItem } from '../../helpers';
import { INewSubscription, INewSubscriptionFormParams, INewSubscriptionService } from '../../types';

import {
  getLineItemConfigPrice,
  getServiceItemConfigPrice,
  getSubscriptionOrderConfigPrice,
} from './helpers';

export const useCalculatePrices = (formik: FormikContextType<INewSubscription>) => {
  const { businessUnitId } = useBusinessContext();
  const { entity: entityParam, subscriptionId } = useParams<INewSubscriptionFormParams>();
  const { subscriptionStore, i18nStore, jobSiteStore, customerStore } = useStores();
  const subscriptionServiceRef = useRef(new SubscriptionService());
  const { values, initialValues, setFieldValue, setFormikState } = formik;
  const [proration, setProration] = useState<ISubscriptionProration | null>(null);

  const isSubscriptionDraftEdit = entityParam === Routes.SubscriptionDraft;

  const calculatePricesConfig = useMemo(() => {
    // TODO: think about better optimizations
    const hasNonEmptyServices = values.serviceItems.some(
      serviceItem =>
        serviceItem.lineItems.length || (serviceItem.billableServiceId && serviceItem.materialId),
    );

    if (
      !values.billingCycle ||
      !values.startDate ||
      !hasNonEmptyServices ||
      !jobSiteStore.selectedEntity?.id ||
      !customerStore.selectedEntity?.id
    ) {
      return null;
    }

    const editablePriceRelatedSubscriptionFields: (keyof INewSubscription)[] = [
      'customRatesGroupId',
      'startDate',
    ];

    const isSubscriptionPriceRelatedFieldChanged = !isEqual(
      pick(values, editablePriceRelatedSubscriptionFields),
      pick(initialValues, editablePriceRelatedSubscriptionFields),
    );

    const config: ICalculateSubscriptionPricesConfig = {
      customerId: customerStore.selectedEntity?.id, // values.customerId,
      customerJobSiteId: values.customerJobSiteId ?? null,
      businessUnitId: +businessUnitId,
      businessLineId: +values.businessLineId,
      jobSiteId: jobSiteStore.selectedEntity.id,
      billingCycle: values.billingCycle,
      anniversaryBilling: values.anniversaryBilling,
      customRatesGroupId: !values.customRatesGroupId ? null : values.customRatesGroupId,
      startDate: values.startDate,
      endDate: values.endDate ?? null,
      billingCycleCount: 2,
      serviceItems: values.serviceItems.map(serviceItem => {
        const initialServiceItem =
          (serviceItem.id && find(initialValues.serviceItems, { id: serviceItem.id })) || null;

        return {
          serviceItemId: serviceItem.id || null,
          billableServiceId: serviceItem.billableServiceId ?? null,
          materialId: serviceItem.billableService?.materialBasedPricing
            ? serviceItem.materialId ?? null
            : null,
          serviceFrequencyId: serviceItem.serviceFrequencyId,
          price:
            getServiceItemConfigPrice(
              serviceItem,
              initialServiceItem,
              isSubscriptionPriceRelatedFieldChanged,
            ) ?? null,
          quantity: serviceItem.quantity,
          prorationType: serviceItem.billableService?.prorationType ?? null,
          effectiveDate: checkIfUpdatedServiceItem(serviceItem, initialServiceItem ?? undefined)
            ? serviceItem.effectiveDate
            : initialServiceItem?.effectiveDate ?? null,
          serviceDaysOfWeek: convertServiceDaysOfWeek(serviceItem.serviceDaysOfWeek, i18nStore),
          lineItems: serviceItem.lineItems.length
            ? serviceItem.lineItems.map(lineItem => {
                const initialLineItem =
                  (lineItem.id && find(initialServiceItem?.lineItems, { id: lineItem.id })) || null;

                return {
                  lineItemId: lineItem.id ?? null,
                  billableLineItemId: lineItem.billableLineItemId ?? null,
                  price:
                    getLineItemConfigPrice(
                      lineItem,
                      initialLineItem,
                      isSubscriptionPriceRelatedFieldChanged,
                    ) ?? null,
                  effectiveDate: checkIfUpdatedServiceLineItem(
                    lineItem,
                    initialServiceItem ?? undefined,
                  )
                    ? serviceItem.effectiveDate
                    : lineItem.effectiveDate,
                  quantity: lineItem.quantity,
                };
              })
            : undefined,
          subscriptionOrders: !isEmpty(serviceItem.subscriptionOrders)
            ? serviceItem.subscriptionOrders.map(subscriptionOrder => {
                const initialSubscriptionOrder =
                  (subscriptionOrder?.id &&
                    find(initialServiceItem?.subscriptionOrders, { id: subscriptionOrder.id })) ||
                  null;

                return {
                  subscriptionOrderId: subscriptionOrder?.id || null,
                  billableServiceId: subscriptionOrder?.billableServiceId || null,
                  serviceDate: subscriptionOrder?.serviceDate ?? null,
                  price: getSubscriptionOrderConfigPrice(
                    subscriptionOrder,
                    initialSubscriptionOrder,
                    isSubscriptionPriceRelatedFieldChanged,
                    isSubscriptionDraftEdit,
                  ),
                  quantity: subscriptionOrder?.quantity || 0,
                  globalRatesServicesId: subscriptionOrder.globalRatesServicesId,
                };
              })
            : undefined,
        };
      }),
    };

    return config;
  }, [
    values,
    initialValues,
    businessUnitId,
    jobSiteStore.selectedEntity?.id,
    customerStore.selectedEntity?.id,
    i18nStore,
    isSubscriptionDraftEdit,
  ]);

  const [debouncedCalculatePricesConfig] = useDebounce(calculatePricesConfig, 500);
  const previousCalculatePricesConfig = usePrevious(debouncedCalculatePricesConfig);

  const updateSubscriptionPrices = useCallback(
    (subscriptionPrices: ISubscriptionPrices) => {
      setFormikState(prevState => ({
        ...prevState,
        values: {
          ...prevState.values,
          serviceItems: prevState.values.serviceItems.map((prevServiceItem, serviceItemIndex) => {
            const serviceItemPrices = subscriptionPrices.serviceItems[serviceItemIndex];

            return {
              ...prevServiceItem,
              globalRatesRecurringServicesId:
                serviceItemPrices.globalRatesRecurringServicesId ?? undefined,
              customRatesGroupServicesId: serviceItemPrices.customRatesGroupServicesId ?? undefined,
              price: prevServiceItem.unlockOverrides
                ? prevServiceItem.price
                : serviceItemPrices.price,
              lineItems: prevServiceItem.lineItems.map((prevLineItem, lineItemIndex) => {
                const lineItemPrices = serviceItemPrices.lineItems?.[lineItemIndex];

                return {
                  ...prevLineItem,
                  globalRatesRecurringLineItemsBillingCycleId:
                    lineItemPrices.globalRatesRecurringLineItemsBillingCycleId ?? undefined,
                  customRatesGroupRecurringLineItemBillingCycleId:
                    lineItemPrices.customRatesGroupRecurringLineItemBillingCycleId ?? undefined,
                  price: prevLineItem.unlockOverrides ? prevLineItem.price : lineItemPrices.price,
                };
              }),
              subscriptionOrders: !isEmpty(serviceItemPrices.subscriptionOrders)
                ? prevServiceItem.subscriptionOrders.map(
                    (prevSubscriptionOrder, subscriptionOrderIndex) => {
                      const subscriptionOrderPrices =
                        serviceItemPrices.subscriptionOrders?.length > 0
                          ? serviceItemPrices.subscriptionOrders[subscriptionOrderIndex]
                          : null;

                      return {
                        ...prevSubscriptionOrder,
                        globalRatesServicesId:
                          subscriptionOrderPrices?.globalRatesServicesId ?? undefined,
                        customRatesGroupServicesId:
                          subscriptionOrderPrices?.customRatesGroupServicesId ?? undefined,
                        price: prevSubscriptionOrder.unlockOverrides
                          ? prevSubscriptionOrder.price
                          : subscriptionOrderPrices?.price ?? 0,
                      };
                    },
                  )
                : [],
            };
          }),
        },
      }));
    },

    [setFormikState],
  );

  const updateProration = useCallback(
    (prorationData: ISubscriptionProration) => {
      setProration(prorationData);

      setFormikState(prevState => {
        const newValues: INewSubscription = {
          ...prevState.values,
          grandTotal: prorationData.grandTotal,
          recurringGrandTotal: prorationData.recurringGrandTotal,
        };

        if (prorationData.prorationPeriods[0][0][0]) {
          newValues.periodFrom = prorationData.prorationPeriods[0][0][0].periodFrom;
          newValues.periodTo = prorationData.prorationPeriods[0][0][0].periodTo;
        }

        if (values.status === SubscriptionStatusEnum.Active || !subscriptionId) {
          newValues.showProrationButton = prorationData.showProrationButton;
        }

        return {
          ...prevState,
          values: newValues,
        };
      });
    },
    [setFormikState, subscriptionId, values.status],
  );

  const resetSubscriptionPrices = useCallback(() => {
    const updatedServiceItems: INewSubscriptionService[] = values.serviceItems.map(serviceItem => ({
      ...serviceItem,
      price: 0,
      globalRatesRecurringServicesId: undefined,
      customRatesGroupServicesId: undefined,
      lineItems: serviceItem.lineItems.map(lineItem => ({
        ...lineItem,
        price: 0,
        globalRatesRecurringLineItemsBillingCycleId: undefined,
        customRatesGroupRecurringLineItemBillingCycleId: undefined,
      })),
      subscriptionOrders: serviceItem.subscriptionOrders.map(subscriptionOrder => ({
        ...subscriptionOrder,
        price: 0,
        globalRatesServicesId: undefined,
        customRatesGroupServicesId: undefined,
      })),
    }));

    setFieldValue(`serviceItems`, updatedServiceItems, false);
  }, [setFieldValue, values.serviceItems]);

  const resetProration = useCallback(() => {
    setProration(null);

    setFormikState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values,
        showProrationButton: undefined,
        grandTotal: 0,
        recurringGrandTotal: 0,
        periodFrom: undefined,
        periodTo: undefined,
      },
    }));
  }, [setFormikState]);

  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    const calculatePrices = async () => {
      if (isEqual(debouncedCalculatePricesConfig, previousCalculatePricesConfig)) {
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();

      abortControllerRef.current = abortController;

      if (debouncedCalculatePricesConfig) {
        let calculation;

        try {
          const subscriptionPricing = await subscriptionServiceRef.current.calculatePrices(
            debouncedCalculatePricesConfig,
            abortController.signal,
          );

          calculation = convertCalculationDates(subscriptionPricing);
        } catch (error: unknown) {
          const typedError = error as ApiError;
          if (typedError.name !== 'AbortError') {
            NotificationHelper.error('default', typedError?.response?.code as ActionCode);
            Sentry.addBreadcrumb({
              category: 'Subscription',
              message: `Subscriptions Calculate Prices Error ${JSON.stringify(
                typedError?.message,
              )}`,
              data: {
                businessUnitId,
              },
            });
            Sentry.captureException(typedError);
          }
        }

        if (calculation) {
          updateSubscriptionPrices(calculation.subscriptionPrices);
          updateProration(calculation.subscriptionPriceCalculation);
        }
      } else if (previousCalculatePricesConfig) {
        resetSubscriptionPrices();
        resetProration();
      }
    };

    calculatePrices();
  }, [
    subscriptionStore,
    updateSubscriptionPrices,
    debouncedCalculatePricesConfig,
    previousCalculatePricesConfig,
    resetSubscriptionPrices,
    updateProration,
    resetProration,
    values,
    businessUnitId,
  ]);

  return { proration };
};
