import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams, useRouteMatch } from 'react-router';

import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { IServiceItem, ISubscription, ISubscriptionDraft, ReminderTypes } from '@root/types';
import { useBusinessContext, usePermission, useStores } from '@hooks';

import { isEmpty } from 'lodash-es';
import { mapSubscriptionToFormValue } from '../../helpers';
import { INewSubscription, INewSubscriptionFormParams } from '../../types';

export const useEditSubscription = () => {
  const isSubscriptionEdit = !!useRouteMatch(Paths.RequestModule.Subscription.Edit);
  const isSubscriptionClone = !!useRouteMatch(Paths.RequestModule.Subscription.Clone);
  const { subscriptionId: subscriptionIdParam, entity: entityParam } =
    useParams<INewSubscriptionFormParams>();
  const { t } = useTranslation();

  const subscriptionId = parseInt(subscriptionIdParam, 10);

  const {
    subscriptionStore,
    subscriptionDraftStore,
    billableServiceStore,
    lineItemStore,
    globalRateStore,
    priceGroupStore,
    materialStore,
    customerStore,
    jobSiteStore,
    subscriptionOrderStore,
    equipmentItemStore,
    reminderStore,
    i18nStore,
  } = useStores();

  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const canUnlockSubscriptionOverrides = usePermission('subscriptions:unlock-overrides:perform');

  const intl = useIntl();

  const [subscriptionFormValue, setSubscriptionFormValue] = useState<INewSubscription>();

  const store =
    entityParam === Routes.SubscriptionDraft ? subscriptionDraftStore : subscriptionStore;
  const selectedSubscription = store.selectedEntity;

  const getServiceItemFrequencies = useCallback(
    async (subscription: ISubscription | ISubscriptionDraft, serviceItem: IServiceItem) => {
      if (subscription.customRatesGroup) {
        priceGroupStore.requestServices({
          billableServiceId:
            serviceItem.billableService?.originalId ?? serviceItem.billableService?.id,
          businessLineId: subscription.businessLine?.id.toString(),
          businessUnitId: subscription.businessUnit?.id.toString(),
          materialId: serviceItem.material?.id,
          equipmentItemId: serviceItem.billableService.equipmentItemId,
          priceGroupId: subscription.customRatesGroup?.id,
        });
      } else {
        globalRateStore.requestRecurringServices({
          billableServiceId:
            serviceItem.billableService?.originalId ?? serviceItem.billableService?.id,
          businessLineId: subscription.businessLine?.id.toString(),
          businessUnitId: subscription.businessUnit?.id.toString(),
          materialId: serviceItem.material?.id,
          equipmentItemId: serviceItem.billableService.equipmentItemId,
        });
      }

      const frequencies = await billableServiceStore.requestFrequencies(
        serviceItem.billableService?.originalId ?? serviceItem.billableService?.id,
        {
          globalRateRecurringServiceId: globalRateStore.getRecurrentServiceByBillableServiceId(
            serviceItem.billableService?.originalId ?? serviceItem.billableService?.id,
          )?.id,
          customRateRecurringServiceId: priceGroupStore.priceGroupService(
            serviceItem.billableService?.originalId ?? serviceItem.billableService?.id,
          )?.id,
        },
      );

      return frequencies ?? [];
    },
    [billableServiceStore, globalRateStore, priceGroupStore],
  );

  const getServiceItemMaterial = useCallback(
    async (serviceItem: IServiceItem) => {
      const materials = await materialStore.requestByEquipmentItem(
        serviceItem.billableService.equipmentItemId,
      );

      return materials ?? [];
    },
    [materialStore],
  );

  const getAnnualReminderConfig = useCallback(
    async (entityId: number) => {
      const reminderConfig = await reminderStore.getReminderScheduleBy(
        entityId,
        ReminderTypes.AnnualEventReminder,
      );

      return reminderConfig;
    },
    [reminderStore],
  );

  const getShortDescription = useCallback(
    async (serviceItem: IServiceItem) => {
      const equipmentItem = await equipmentItemStore.requestById(
        serviceItem.billableService.equipmentItemId,
      );

      return equipmentItem?.shortDescription;
    },
    [equipmentItemStore],
  );

  const getEquipmentType = useCallback(
    async (subscription: ISubscription | ISubscriptionDraft) => {
      if (isEmpty(subscription.serviceItems)) {
        return undefined;
      }
      const equipmentItem = await equipmentItemStore.requestById(
        subscription.serviceItems[0].billableService.equipmentItemId,
      );

      return equipmentItem?.type;
    },
    [equipmentItemStore],
  );

  useEffect(() => {
    (async () => {
      if ((isSubscriptionEdit || isSubscriptionClone) && subscriptionId) {
        await store.requestById(subscriptionId);

        if (!store.selectedEntity) {
          const route = pathToUrl(Paths.RequestModule.Request, {
            businessUnit: businessUnitId,
          });

          history.replace(route);
        }
      }
    })();

    return () => {
      if (isSubscriptionEdit || isSubscriptionClone) {
        store.unSelectEntity();
      }
    };
  }, [businessUnitId, history, subscriptionId, store, isSubscriptionEdit, isSubscriptionClone]);

  useEffect(() => {
    (async () => {
      if ((isSubscriptionEdit || isSubscriptionClone) && store.selectedEntity?.updatedAt) {
        const subscription = store.selectedEntity;
        const { region } = i18nStore;

        if (subscription) {
          const [billableServices, equipmentType, taxDistricts] = await Promise.all([
            billableServiceStore.request({
              businessLineId: subscription.businessLine?.id,
              activeOnly: true,
              billingCycle: subscription.billingCycle,
            }),
            getEquipmentType(subscription),
            jobSiteStore.requestTaxDistrictsForCustomer({
              customerId: subscription.customer?.originalId ?? subscription.customer?.id,
              jobSiteId: subscription.jobSite?.originalId ?? subscription.jobSite?.id,
            }),
          ]);

          lineItemStore.request({
            businessLineId: subscription.businessLine?.id,
            oneTime: false,
            activeOnly: true,
            billingCycle: subscription.billingCycle,
          });

          if (billableServices) {
            const subscriptionFormValueMap = await mapSubscriptionToFormValue({
              subscription,
              equipmentType,
              taxDistricts,
              billableServices,
              getServiceItemFrequencies,
              getServiceItemMaterial,
              getShortDescription,
              getAnnualReminderConfig,
              intl,
              t,
              isSubscriptionClone,
              canUnlockSubscriptionOverrides,
              region,
            });

            setSubscriptionFormValue(subscriptionFormValueMap);
          }
        }
      }
    })();
  }, [
    billableServiceStore,
    globalRateStore,
    materialStore,
    priceGroupStore,
    subscriptionId,
    store,
    store.selectedEntity?.updatedAt,
    subscriptionOrderStore,
    jobSiteStore,
    getServiceItemMaterial,
    getShortDescription,
    getServiceItemFrequencies,
    getEquipmentType,
    intl,
    t,
    isSubscriptionEdit,
    isSubscriptionClone,
    canUnlockSubscriptionOverrides,
    getAnnualReminderConfig,
    i18nStore,
    lineItemStore,
  ]);

  useEffect(() => {
    if (subscriptionId && selectedSubscription) {
      customerStore.requestById(
        selectedSubscription.customer?.originalId ?? selectedSubscription.customer?.id,
      );
      jobSiteStore.requestById(
        selectedSubscription.jobSite?.originalId ?? selectedSubscription.jobSite?.id,
      );
    }
  }, [customerStore, jobSiteStore, subscriptionId, selectedSubscription]);

  if (isSubscriptionClone && subscriptionFormValue) {
    return {
      subscriptionCloneFormValue: {
        ...subscriptionFormValue,
        clonedFromSubscriptionId: subscriptionFormValue?.id,
      },
    };
  }

  return {
    subscriptionFormValue,
  };
};
