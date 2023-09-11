import { useCallback, useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router';
import { omit } from 'lodash-es';

import { determinePartOfDay } from '@root/components/OrderTimePicker/helpers';
import { ClientRequestType, Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { sanitizeCreditCard } from '@root/modules/billing/CreditCards/store/sanitize';
import { type INewCreditCard } from '@root/modules/billing/types';

import { getOrdersTotal } from './helpers';
import { INewOrderFormData, INewOrders } from './types';

export const useOrdersPayload = () => {
  const {
    billableServiceStore,
    jobSiteStore,
    customerStore,
    projectStore,
    surchargeStore,
    i18nStore,
  } = useStores();
  const { businessUnitId } = useBusinessContext();
  const jobSiteId = jobSiteStore.selectedEntity?.id;
  const customerId = customerStore.selectedEntity?.id;
  const projectId = projectStore.selectedEntity?.id;

  return useCallback(
    (values: INewOrders): INewOrders | null => {
      if (!jobSiteId || !customerId) {
        return null;
      }
      const orders = values.orders.map((order): INewOrderFormData => {
        return {
          ...order,
          jobSite2Id:
            billableServiceStore.getById(order.billableServiceId)?.action === 'reposition'
              ? jobSiteId
              : order.jobSite2Id,
          orderContactId:
            order.orderContactId === 0 ? values.jobSiteContactId : order.orderContactId,
          customRatesGroupId:
            order.customRatesGroupId === 0 || (order.noBillableService && !order.lineItems?.length)
              ? undefined
              : order.customRatesGroupId,
          materialProfileId: order.materialProfileId === 0 ? null : order.materialProfileId,
          driverInstructions: `${order.droppedEquipmentItemComment}${
            order.driverInstructions ?? ''
          }`,
          lineItems: order.lineItems?.length
            ? order.lineItems.map(lineItem => ({
                ...lineItem,
                materialId: lineItem.materialId ?? null,
              }))
            : [],
          applySurcharges: values.applySurcharges,
          route: order.route ?? null,
        };
      });

      return {
        ...omit(values, 'annualReminderConfig'),
        businessUnitId,
        customerId,
        jobSiteId,
        projectId,
        grandTotal: getOrdersTotal({
          orders,
          businessLineId: values.businessLineId,
          commercialTaxesUsed: values.commercialTaxesUsed,
          region: i18nStore.region,
          taxDistricts: values.taxDistricts,
          surcharges: surchargeStore.values,
        }),
        orders,
        payments: values.payments
          .filter(payment => !!payment.paymentMethod)
          .map(payment => ({
            ...payment,
            creditCardId: payment.creditCardId === 0 ? undefined : payment.creditCardId,
            newCreditCard:
              payment.creditCardId === 0 && payment.newCreditCard
                ? ({
                    ...sanitizeCreditCard(payment.newCreditCard),
                    customerId,
                    jobSites: [jobSiteId],
                  } as INewCreditCard)
                : undefined,
          })),
        surcharges: values.surcharges,
      };
    },
    [
      billableServiceStore,
      businessUnitId,
      customerId,
      i18nStore.region,
      jobSiteId,
      projectId,
      surchargeStore.values,
    ],
  );
};

export const useRecurrentOrderPayload = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const { recurrentOrderStore, jobSiteStore, customerStore } = useStores();
  const selectedRecurrentOrder = recurrentOrderStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;
  const selectedJobSite = jobSiteStore.selectedEntity;
  const customerId = selectedRecurrentOrder?.customer.originalId;
  const jobSiteId = selectedRecurrentOrder?.jobSite.originalId;

  useEffect(() => {
    if (!!orderId && !!customerId && !selectedCustomer) {
      customerStore.requestById(customerId, false);
    }
  }, [customerId, customerStore, orderId, selectedCustomer]);

  useEffect(() => {
    if (!!orderId && !!jobSiteId && !selectedJobSite) {
      jobSiteStore.requestById(jobSiteId);
    }
  }, [jobSiteId, jobSiteStore, orderId, selectedJobSite]);

  useEffect(() => {
    if (orderId && !selectedRecurrentOrder) {
      recurrentOrderStore.cleanup();
      recurrentOrderStore.requestById(Number(orderId));
    }
  }, [orderId, recurrentOrderStore, selectedRecurrentOrder]);

  if (!selectedRecurrentOrder) {
    return null;
  }

  return {
    id: orderId,
    businessUnitId: selectedRecurrentOrder.businessUnit.id.toString(),
    businessLineId: selectedRecurrentOrder.businessLine.id.toString(),
    customerId: selectedRecurrentOrder.customer.originalId,
    jobSiteId: selectedRecurrentOrder.jobSite.originalId,
    customerJobSiteId: selectedRecurrentOrder.customerJobSite?.id,
    jobSiteContactId: selectedRecurrentOrder.jobSiteContact?.originalId,
    serviceAreaId: selectedRecurrentOrder.serviceArea?.originalId,
    projectId: selectedRecurrentOrder.project?.originalId ?? undefined,
    type: ClientRequestType.RecurrentOrder,
    searchString: '',
    applySurcharges: selectedRecurrentOrder.applySurcharges,

    recurrentTemplateData: {
      noBillableService: !selectedRecurrentOrder.billableService,
      someoneOnSite: selectedRecurrentOrder.someoneOnSite,
      toRoll: selectedRecurrentOrder.toRoll,
      highPriority: selectedRecurrentOrder.highPriority,
      earlyPick: selectedRecurrentOrder.earlyPick,
      orderContactId: selectedRecurrentOrder.orderContact?.originalId,
      billableServiceId: selectedRecurrentOrder.billableService?.originalId ?? null,
      materialId: selectedRecurrentOrder.material?.originalId ?? null,
      materialProfileId: selectedRecurrentOrder.materialProfile?.originalId ?? undefined,
      billableServicePrice: selectedRecurrentOrder.billableServicePrice ?? null,
      billableServiceQuantity: selectedRecurrentOrder.billableServiceQuantity,
      globalRatesServicesId: selectedRecurrentOrder.globalRatesServices?.originalId ?? null,
      customRatesGroupServicesId:
        selectedRecurrentOrder.customRatesGroupServices?.originalId ?? null,
      equipmentItemsMaterialsOptions: [],
      startDate: selectedRecurrentOrder.startDate,
      endDate: selectedRecurrentOrder.endDate ?? undefined,
      frequencyType: selectedRecurrentOrder.frequencyType,
      frequencyPeriod: selectedRecurrentOrder.frequencyPeriod ?? undefined,
      customFrequencyType: selectedRecurrentOrder.customFrequencyType ?? undefined,
      frequencyDays: selectedRecurrentOrder.frequencyDays ?? [],
      callOnWayPhoneNumberId: selectedRecurrentOrder.callOnWayPhoneNumberId,
      callOnWayPhoneNumber: selectedRecurrentOrder.callOnWayPhoneNumber,
      textOnWayPhoneNumberId: selectedRecurrentOrder.textOnWayPhoneNumberId,
      textOnWayPhoneNumber: selectedRecurrentOrder.textOnWayPhoneNumber,
      lineItems: (selectedRecurrentOrder.lineItems ?? []).map(lineItem => ({
        ...lineItem,
        customRatesGroupLineItemsId: lineItem.customRatesGroupLineItem?.originalId ?? null,
        billableLineItemId: lineItem.billableLineItem.originalId,
        materialId: lineItem.material?.originalId,
        globalRatesLineItemsId: lineItem.globalRatesLineItem.originalId,
      })),
      driverInstructions: selectedRecurrentOrder.driverInstructions ?? null,
      permitId: selectedRecurrentOrder.permit?.originalId ?? undefined,
      purchaseOrder: selectedRecurrentOrder.purchaseOrder ?? undefined,
      purchaseOrderId: selectedRecurrentOrder.purchaseOrderId ?? undefined,
      isOneTimePO: selectedRecurrentOrder.purchaseOrder?.isOneTime ?? false,
      oneTimePurchaseOrderNumber: selectedRecurrentOrder.purchaseOrder?.isOneTime
        ? selectedRecurrentOrder.purchaseOrder?.poNumber
        : undefined,
      bestTimeToCome: selectedRecurrentOrder.bestTimeToComeFrom
        ? determinePartOfDay(
            selectedRecurrentOrder.bestTimeToComeFrom,
            selectedRecurrentOrder.bestTimeToComeTo,
          )
        : 'any',
      bestTimeToComeFrom: selectedRecurrentOrder.bestTimeToComeFrom,
      bestTimeToComeTo: selectedRecurrentOrder.bestTimeToComeTo,
      disposalSiteId: selectedRecurrentOrder.disposalSite?.originalId ?? undefined,
      notifyDayBefore: selectedRecurrentOrder.notifyDayBefore,
      notificationApplied: !!selectedRecurrentOrder.notifyDayBefore,
      equipmentItemId: selectedRecurrentOrder?.equipmentItem?.originalId ?? null,
      thirdPartyHaulerId: selectedRecurrentOrder.thirdPartyHauler?.originalId ?? null,
      customRatesGroupId: selectedRecurrentOrder.customRatesGroup?.originalId ?? 0,
      selectedGroup: null,
      grandTotal: selectedRecurrentOrder.grandTotal,
      unlockOverrides: selectedRecurrentOrder.unlockOverrides,
      promoId: selectedRecurrentOrder.promo?.originalId ?? null,
      popupNote: selectedRecurrentOrder.customer?.popupNote ?? '',
      applySurcharges: selectedRecurrentOrder.applySurcharges,
      billableServiceApplySurcharges: selectedRecurrentOrder.billableServiceApplySurcharges,
    },
  };
};

export const useOrderRequestPayload = () => {
  const { orderRequestId: orderRequestIdRaw } = useParams<{ orderRequestId: string }>();

  const { orderRequestStore, jobSiteStore, customerStore, businessUnitStore, contactStore } =
    useStores();

  const history = useHistory();
  const { businessUnitId } = useBusinessContext();

  const orderRequestId = +orderRequestIdRaw;

  const selectedOrderRequest = orderRequestStore.selectedEntity;
  const customerId = selectedOrderRequest?.customerId;
  const jobSiteId = selectedOrderRequest?.jobSiteId;
  const customerMainContact = contactStore.values.find(x => x.main);

  const businessUnit = businessUnitStore.getById(businessUnitId);

  const isSalesPointRequest = selectedOrderRequest?.contractorId === -1;

  useEffect(() => {
    if (orderRequestId) {
      const query = async () => {
        const maybeOrderRequest = await orderRequestStore.requestById({
          id: orderRequestId,
          businessUnitId,
        });

        if (maybeOrderRequest && maybeOrderRequest.status === 'requested') {
          orderRequestStore.selectEntity(maybeOrderRequest, false);
        } else {
          const route = pathToUrl(Paths.RequestModule.Request, {
            businessUnit: businessUnitId,
          });

          history.replace(route);
        }
      };

      query();
    }
  }, [businessUnitId, history, orderRequestId, orderRequestStore]);

  useEffect(() => {
    if (!!orderRequestId && !!customerId) {
      customerStore.requestById(customerId, false);
    }
  }, [customerId, customerStore, orderRequestId]);

  useEffect(() => {
    if (!!orderRequestId && !!jobSiteId) {
      jobSiteStore.requestById(jobSiteId);
    }
  }, [jobSiteId, jobSiteStore, orderRequestId]);

  useEffect(() => {
    if (customerId && isSalesPointRequest) {
      contactStore.requestByCustomer({
        customerId,
      });
    }
  }, [contactStore, customerId, isSalesPointRequest]);

  const orderRequestPayload = useMemo(() => {
    if (!selectedOrderRequest) {
      return null;
    }

    return {
      contractorId: selectedOrderRequest.contractorId,
      serviceAreaId: selectedOrderRequest.serviceAreaId,
      businessUnitId: selectedOrderRequest.customer.businessUnitId.toString(),
      businessLineId: selectedOrderRequest.material.businessLineId.toString(),
      customerId: selectedOrderRequest.customerId,
      jobSiteId: selectedOrderRequest.jobSiteId,
      jobSiteContactId: isSalesPointRequest
        ? customerMainContact?.id ?? 0
        : selectedOrderRequest.jobSite.contactId ?? 0,
      poRequired: selectedOrderRequest.customer.poRequired,
      permitRequired: false,
      signatureRequired: selectedOrderRequest.customer?.signatureRequired ?? false,
      popupNote: selectedOrderRequest.customer?.popupNote ?? '',
      alleyPlacement: selectedOrderRequest.alleyPlacement ?? false,
      grandTotal: selectedOrderRequest.grandTotal,
      unlockOverrides: false,
      type: ClientRequestType.OrderRequest,
      searchString: '',
      mediaUrls: selectedOrderRequest.mediaUrls ?? [],
      contractorContact: selectedOrderRequest.contractorContact,

      payments: [
        {
          paymentMethod: selectedOrderRequest.paymentMethod,
          authorizeCard: true,
          sendReceipt: selectedOrderRequest.sendReceipt,
          amount: selectedOrderRequest.grandTotal,
          creditCardId: selectedOrderRequest.creditCardId,
          isAch: false,
        },
      ],

      someoneOnSite: selectedOrderRequest.someoneOnSite ?? false,
      equipmentItemId: selectedOrderRequest.equipmentItemId,
      driverInstructions: selectedOrderRequest.driverInstructions ?? undefined,
      purchaseOrder: selectedOrderRequest.purchaseOrder ?? undefined,
      purchaseOrderId: selectedOrderRequest.purchaseOrder?.id ?? undefined,
      orderRequestId: selectedOrderRequest.id,
      applySurcharges: businessUnit?.applySurcharges,

      orders: [
        {
          orderRequestId: selectedOrderRequest.id,
          droppedEquipmentItemComment: '',
          jobSite2IdSearchString: '',
          promoApplied: false,
          noBillableService: false,
          droppedEquipmentItemApplied: false,
          someoneOnSite: selectedOrderRequest.someoneOnSite ?? false,
          toRoll: false,
          highPriority: false,
          earlyPick: false,
          orderContactId: 0,
          jobSite2Id: selectedOrderRequest.jobSite2Id ?? undefined,
          billableServiceId: selectedOrderRequest.billableServiceId,
          materialId: selectedOrderRequest.materialId,
          billableServicePrice: selectedOrderRequest.billableServicePrice,
          billableServiceQuantity: selectedOrderRequest.billableServiceQuantity,
          billableServiceApplySurcharges: !!selectedOrderRequest.billableService?.applySurcharges,
          globalRatesServicesId: undefined,
          customRatesGroupServicesId: undefined,
          equipmentItemsMaterialsOptions: [],
          serviceDate: selectedOrderRequest.serviceDate,
          callOnWayPhoneNumberId: undefined,
          callOnWayPhoneNumber: undefined,
          textOnWayPhoneNumberId: undefined,
          textOnWayPhoneNumber: undefined,
          lineItems: [],
          driverInstructions: selectedOrderRequest.driverInstructions,
          permitId: undefined,
          purchaseOrder: selectedOrderRequest.purchaseOrder ?? undefined,
          bestTimeToCome: 'any',
          bestTimeToComeFrom: null,
          bestTimeToComeTo: null,
          disposalSiteId: undefined,
          notifyDayBefore: null,
          notificationApplied: false,
          equipmentItemId: selectedOrderRequest.equipmentItemId,
          thirdPartyHaulerId: undefined,
          customRatesGroupId: 0,
          droppedEquipmentItem: undefined,
          assignEquipmentItem: false,
          assignedEquipmentOptions: [],
          selectedGroup: null,
          applySurcharges: businessUnit?.applySurcharges,
          purchaseOrderId: selectedOrderRequest.purchaseOrder?.id ?? undefined,
        },
      ],
    };
  }, [
    businessUnit?.applySurcharges,
    customerMainContact?.id,
    isSalesPointRequest,
    selectedOrderRequest,
  ]);

  return orderRequestPayload;
};
