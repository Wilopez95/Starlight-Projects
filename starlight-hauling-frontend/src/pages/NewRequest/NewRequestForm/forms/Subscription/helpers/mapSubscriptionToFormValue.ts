import { endOfToday, isAfter } from 'date-fns';

import { determinePartOfDay } from '@root/components/OrderTimePicker/helpers';
import { BillingCycleEnum, ClientRequestType, defaultReminderSchedule } from '@root/consts';
import { billableServiceToSelectOption, parseDate } from '@root/helpers';
import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionDraft } from '@root/stores/subscriptionDraft/SubscriptionDraft';
import {
  IBillableService,
  IConfigurableReminderSchedule,
  IPriceGroup,
  IServiceDaysOfWeek,
  ISubscriptionOrder,
  ReminderTypes,
  SubscriptionOrderStatusEnum,
  VersionedEntity,
} from '@root/types';

import { isEmpty } from 'lodash-es';
import { getDefaultOrderValue } from '../../Order/formikData';
import {
  INewSubscription,
  INewSubscriptionOrders,
  INewSubscriptionService,
  IServiceDayOfWeek,
} from '../types';

import { getFrequencyOption } from './getFrequencyOptions';
import { getLatestEffectiveDate } from './getLatestEffectiveDate';
import { getPreSelectedHistoricalOption } from './getPreSelectedFieldData';
import {
  IMapSubscriptionToNewClientRequestInput,
  IMapSubscriptionToSubscriptionOrder,
} from './types';

const today = endOfToday();

const getSubscriptionOrderOptions = (
  isSubscriptionDraft: boolean,
  subscriptionOrder: ISubscriptionOrder,
  billableServices: IBillableService[],
) => {
  if (isSubscriptionDraft) {
    return billableServices
      .filter(
        billableService =>
          billableService.equipmentItem?.id ===
            subscriptionOrder.billableService?.equipmentItemId &&
          subscriptionOrder.billableService.action === billableService.action,
      )
      .map(billableService => ({
        ...billableServiceToSelectOption(billableService),
        action: billableService.action,
      }));
  }

  return [
    {
      ...billableServiceToSelectOption({
        ...subscriptionOrder.billableService,
        id: subscriptionOrder.billableService.originalId,
      }),
      action: subscriptionOrder.billableService.action,
    },
  ];
};

const customRatesGroupOptionsValue = (
  customRatesGroup: VersionedEntity<IPriceGroup> | undefined,
) => {
  return customRatesGroup
    ? [
        {
          value: customRatesGroup.id,
          label: customRatesGroup.description,
        },
      ]
    : [];
};

const annualReminderConfigValue = (
  annualReminderConfig: IConfigurableReminderSchedule | undefined,
) => {
  return (
    annualReminderConfig ?? {
      type: ReminderTypes.AnnualEventReminder,
      ...defaultReminderSchedule,
    }
  );
};

const competitorIdValue = (subscription: Subscription | SubscriptionDraft) => {
  return subscription instanceof SubscriptionDraft
    ? subscription?.competitor?.id ?? undefined
    : undefined;
};

export const mapSubscriptionToFormValue = async ({
  subscription,
  equipmentType,
  billableServices,
  getServiceItemFrequencies,
  getServiceItemMaterial,
  getShortDescription,
  getAnnualReminderConfig,
  intl,
  t,
  isSubscriptionClone,
  canUnlockSubscriptionOverrides,
}: IMapSubscriptionToNewClientRequestInput): Promise<INewSubscription> => {
  const annualReminderConfig = await getAnnualReminderConfig(subscription.id);

  const subscriptionEdit: INewSubscription = {
    id: subscription.id,
    type: ClientRequestType.Subscription,
    searchString: isSubscriptionClone ? subscription.customer.name ?? '' : '',
    customerId: subscription.customer.id,
    jobSiteId: subscription.jobSite.id,
    customerJobSiteId:
      subscription instanceof Subscription
        ? subscription.customerJobSite?.originalId ?? null
        : undefined,
    serviceAreaId: subscription.serviceArea?.originalId ?? subscription.serviceArea?.id,
    businessLineId: subscription.businessLine.id.toString(),
    businessUnitId: subscription.businessUnit.id.toString(),
    jobSiteContactId:
      subscription.jobSiteContact?.originalId ?? subscription.jobSiteContact?.id ?? 0,
    orderContactId:
      subscription.subscriptionContact?.originalId ?? subscription.subscriptionContact?.id ?? 0,
    poRequired: subscription.customer?.poRequired ?? false,
    permitRequired: false,
    signatureRequired: subscription.customer?.signatureRequired ?? false,
    popupNote: subscription.customer?.popupNote ?? '',
    alleyPlacement: subscription.jobSite?.alleyPlacement ?? false,
    grandTotal: subscription.grandTotal,
    recurringGrandTotal: 0,
    billingType: subscription.billingType,
    billingCycle: subscription.billingCycle,
    anniversaryBilling: subscription.anniversaryBilling,
    unlockOverrides: canUnlockSubscriptionOverrides ? subscription.unlockOverrides : false,
    csrComment: subscription instanceof Subscription ? subscription.csrComment ?? '' : '',
    status: subscription instanceof Subscription ? subscription.status : undefined,
    competitorId: competitorIdValue(subscription),
    competitorExpirationDate:
      subscription instanceof SubscriptionDraft
        ? subscription.competitorExpirationDate ?? undefined
        : undefined,
    startDate: subscription.startDate,
    endDate: subscription.endDate ?? undefined,
    minBillingPeriods: subscription.minBillingPeriods,
    highPriority: subscription.highPriority,
    someoneOnSite: subscription.someoneOnSite ?? false,
    bestTimeToCome: determinePartOfDay(
      subscription.bestTimeToComeFrom,
      subscription.bestTimeToComeTo,
    ),
    bestTimeToComeFrom: subscription.bestTimeToComeFrom,
    bestTimeToComeTo: subscription.bestTimeToComeTo,
    serviceItems: await Promise.all(
      subscription.serviceItems.map(async (serviceItem): Promise<INewSubscriptionService> => {
        const [frequencies, materials, shortDescription] = await Promise.all([
          getServiceItemFrequencies(subscription, serviceItem),
          getServiceItemMaterial(serviceItem),
          getShortDescription(serviceItem),
        ]);

        const quantity = parseInt(<string>serviceItem.quantity, 10);
        const effectiveDate = getLatestEffectiveDate(serviceItem);

        const historicalMaterial = {
          value: serviceItem.material.originalId,
          label: serviceItem.material.description,
        };

        const materialOptions = materials.map(material => ({
          value: material.id,
          label: material.description,
        }));

        const preSelectedHistoricalMaterial = getPreSelectedHistoricalOption(
          materialOptions,
          historicalMaterial,
        );

        const serviceFrequencyOptions = serviceItem.serviceFrequency?.[0]?.id
          ? getFrequencyOption({ t, serviceItem, frequencies })
          : [];

        //if (subscription instanceof SubscriptionDraft) {
        const serviceDaysOfWeeks: IServiceDaysOfWeek | undefined = {};
        Object.keys(serviceItem.serviceDaysOfWeek ?? {}).forEach(key => {
          const newKey: number =
            Number.parseInt(key, 10) + 1 > 6 ? 0 : Number.parseInt(key, 10) + 1;
          if (serviceDaysOfWeeks && serviceItem.serviceDaysOfWeek) {
            serviceDaysOfWeeks[newKey] = serviceItem.serviceDaysOfWeek[Number.parseInt(key, 10)];
          }
        });
        serviceItem.serviceDaysOfWeek = serviceDaysOfWeeks;
        //}

        return {
          id: serviceItem.id,
          createdAt: serviceItem.createdAt,
          billableServiceId:
            serviceItem.billableService.originalId ?? serviceItem.billableService.id,
          preSelectedService: {
            // TODO: remove and user billableService instead
            value: serviceItem.billableService.originalId,
            label: serviceItem.billableService.description,
          },
          billableService: serviceItem.billableService,
          billableServiceAction: serviceItem.billableService.action,
          materialId: serviceItem.material.originalId ?? serviceItem.material.id,
          lineItems:
            serviceItem.lineItems?.map(lineItem => ({
              ...lineItem,
              serviceId: serviceItem.id,
              billableLineItemId:
                lineItem.billableLineItem?.originalId ?? lineItem.billableLineItemId,
              effectiveDate: lineItem.effectiveDate ? parseDate(lineItem.effectiveDate) : null,
            })) ?? [],
          globalRatesRecurringServicesId: serviceItem.globalRatesRecurringServicesId,
          customRatesGroupServicesId: serviceItem.customRatesGroupServicesId ?? undefined,
          quantity,
          shortDescription,
          serviceFrequencyId: serviceItem.serviceFrequencyId,
          // frequency id null case with rental service
          serviceFrequencyOptions,
          equipmentItemsMaterialsOptions: preSelectedHistoricalMaterial
            ? [preSelectedHistoricalMaterial, ...materialOptions]
            : materialOptions,
          subscriptionOrders: isEmpty(serviceItem.subscriptionOrders)
            ? []
            : serviceItem.subscriptionOrders.map(subscriptionOrder => ({
                ...subscriptionOrder,
                unlockOverrides: subscriptionOrder.unlockOverrides || false,
                globalRatesServicesId: subscriptionOrder.globalRatesServicesId ?? undefined,
                billableServiceId:
                  subscriptionOrder.billableService?.originalId ??
                  subscriptionOrder.billableServiceId,
                serviceId: serviceItem.id,
                subscriptionOrderOptions: getSubscriptionOrderOptions(
                  subscription instanceof SubscriptionDraft,
                  subscriptionOrder,
                  billableServices,
                ),
                action: subscriptionOrder.billableService.action,
              })),
          optionalSubscriptionOrders: [],
          serviceDaysOfWeek: Object.entries(intl.weekDays).reduce(
            (serviceDays: IServiceDayOfWeek[], [day, dayNumber]) =>
              serviceItem?.serviceDaysOfWeek?.[dayNumber]
                ? [
                    ...serviceDays,
                    {
                      day,
                      route: serviceItem.serviceDaysOfWeek[dayNumber].route,
                      requiredByCustomer:
                        serviceItem.serviceDaysOfWeek[dayNumber].requiredByCustomer,
                    },
                  ]
                : serviceDays,
            [],
          ),
          unlockOverrides: serviceItem.unlockOverrides,
          price: serviceItem.price,
          billingCycle: BillingCycleEnum.monthly,
          effectiveDate,
          showEffectiveDate: false,
          isDeleted: serviceItem.isDeleted,
        };
      }),
    ),
    equipmentType,
    driverInstructions: subscription.driverInstructions ?? undefined,
    permitId: subscription.permit?.originalId ?? subscription.permit?.id,
    purchaseOrder: subscription.purchaseOrder ?? undefined,
    purchaseOrderId: subscription.purchaseOrder?.id,
    thirdPartyHaulerId:
      subscription.thirdPartyHauler?.originalId ?? subscription.thirdPartyHauler?.id,
    customRatesGroupId: subscription.customRatesGroup?.originalId ?? 0,
    customRatesGroupOptions: customRatesGroupOptionsValue(subscription.customRatesGroup),
    priceGroupOptions: [],
    promoApplied: !!subscription.promo?.id,
    promoId: subscription.promo?.originalId ?? subscription.promo?.id,
    overrideCreditLimit: false,
    invoicedDate: subscription instanceof Subscription ? subscription.invoicedDate : undefined,
    annualReminderConfig: annualReminderConfigValue(annualReminderConfig),
  };

  return subscriptionEdit;
};

export const mapSubscriptionToSubscriptionOrderFormValue = ({
  subscription,
  requestType,
}: IMapSubscriptionToSubscriptionOrder): INewSubscriptionOrders => {
  const isActiveAndNotExpired =
    subscription.purchaseOrder?.active &&
    (!subscription.purchaseOrder?.expirationDate ||
      (subscription.purchaseOrder?.expirationDate &&
        !isAfter(today, subscription.purchaseOrder.expirationDate)));

  return {
    subscriptionId: subscription.id,
    // IBusinessContextIds
    businessLineId: subscription.businessLine.id.toString(),
    businessUnitId: subscription.businessUnit.id.toString(),
    // IOrderCustomerJobSitePairSection
    jobSiteContactId: subscription.jobSiteContact.originalId ?? 0,
    poRequired: subscription.customer?.poRequired ?? false,
    permitRequired: false,
    signatureRequired: subscription.customer?.signatureRequired ?? false,
    cabOver: false,
    popupNote: subscription.customer?.popupNote ?? '',
    alleyPlacement: subscription.jobSite?.alleyPlacement ?? false,
    // IOrderSummarySection
    grandTotal: subscription.grandTotal,
    unlockOverrides: false,
    applySurcharges: subscription.businessUnit?.applySurcharges ?? false,
    // IOrderPaymentSection
    payments: [
      {
        paymentMethod: 'onAccount',
        amount: 0,
        sendReceipt: false,
        authorizeCard: false,
        isAch: false,
      },
    ],
    // INewOrders
    type: requestType,
    orders: [
      {
        ...getDefaultOrderValue(subscription.businessUnit.applySurcharges),
        orderContactId: subscription.subscriptionContact?.originalId ?? 0,
        highPriority: subscription.highPriority,
        bestTimeToCome: subscription.bestTimeToComeFrom ? 'specific' : 'any',
        bestTimeToComeFrom: subscription.bestTimeToComeFrom,
        bestTimeToComeTo: subscription.bestTimeToComeTo,
        equipmentItemId: undefined,
        driverInstructions: subscription.driverInstructions ?? undefined,
        permitId: subscription.permit?.originalId,
        purchaseOrder: isActiveAndNotExpired ? subscription.purchaseOrder : null,
        purchaseOrderId: isActiveAndNotExpired ? subscription.purchaseOrder?.id : undefined,
        thirdPartyHaulerId: subscription.thirdPartyHauler?.originalId,
        customRatesGroupId: subscription.customRatesGroup?.originalId ?? 0,
        droppedEquipmentItem: undefined,

        promoApplied: true,
      },
    ],
    searchString: '',
    customerId: subscription.customer.originalId,
    jobSiteId: subscription.jobSite.originalId,
    customerJobSiteId: subscription.customerJobSite?.originalId ?? null,
    projectId: undefined,
    serviceAreaId: subscription.serviceArea?.originalId,
    status: SubscriptionOrderStatusEnum.scheduled,
    overrideCreditLimit: false,
    commercialTaxesUsed: true,
    subscriptionOrderOptions: [],
  };
};
