import { useCallback } from 'react';

import { formatTime } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import { INewOrderFormData, IOrderSummarySection } from '../Order/types';

import { getOrderTotal } from './helpers';
import {
  IEditRecurrentOrderFormData,
  INewRecurrentOrder,
  INewRecurrentOrderFormData,
} from './types';

export const useRecurrentOrderPayload = () => {
  const { jobSiteStore, customerStore, projectStore, surchargeStore, i18nStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  const jobSiteId = jobSiteStore.selectedEntity?.id;
  const customerId = customerStore.selectedEntity?.id;
  const projectId = projectStore.selectedEntity?.id;

  return useCallback(
    (values: INewRecurrentOrder): INewRecurrentOrder | null => {
      if (!jobSiteId || !customerId) {
        return null;
      }

      const recurrentOrder: INewRecurrentOrderFormData & IOrderSummarySection = {
        ...values.recurrentTemplateData,
        orderContactId:
          values.recurrentTemplateData.orderContactId === 0
            ? values.jobSiteContactId
            : values.recurrentTemplateData.orderContactId,
        customRatesGroupId:
          values.recurrentTemplateData.customRatesGroupId === 0 ||
          (values.recurrentTemplateData.noBillableService &&
            !values.recurrentTemplateData.lineItems?.length)
            ? undefined
            : values.recurrentTemplateData.customRatesGroupId,
        materialProfileId:
          values.recurrentTemplateData.materialProfileId === 0
            ? null
            : values.recurrentTemplateData.materialProfileId,
        driverInstructions: values.recurrentTemplateData.driverInstructions ?? '',
        lineItems: values.recurrentTemplateData.lineItems?.length
          ? values.recurrentTemplateData.lineItems.map(lineItem => ({
              ...lineItem,
              materialId: lineItem.materialId ?? null,
            }))
          : [],
        grandTotal: getOrderTotal({
          order: values.recurrentTemplateData,
          businessLineId: values.businessLineId,
          region: i18nStore.region,
          taxDistricts: values.taxDistricts,
          surcharges: surchargeStore.values,
          commercialTaxesUsed: values.commercialTaxesUsed,
        }),
      };

      const deliveryOrder:
        | (INewOrderFormData & Omit<IOrderSummarySection, 'unlockOverrides'>)
        | undefined = values.delivery
        ? {
            ...values.delivery,
            lineItems: values.delivery.lineItems?.length
              ? values.delivery.lineItems.map(lineItem => ({
                  ...lineItem,
                  materialId: lineItem.materialId ?? null,
                }))
              : [],
            orderContactId:
              values.delivery.orderContactId === 0
                ? values.jobSiteContactId
                : values.delivery.orderContactId,
            customRatesGroupId:
              values.delivery.customRatesGroupId === 0 ||
              (values.delivery.noBillableService && !values.delivery.lineItems?.length)
                ? undefined
                : values.delivery.customRatesGroupId,
            materialProfileId:
              values.delivery.materialProfileId === 0 ||
              values.recurrentTemplateData.materialProfileId === 0
                ? null
                : values.recurrentTemplateData.materialProfileId,
            driverInstructions: values.delivery.driverInstructions ?? '',
            grandTotal: getOrderTotal({
              order: values.delivery,
              businessLineId: values.businessLineId,
              region: i18nStore.region,
              taxDistricts: values.taxDistricts,
              surcharges: surchargeStore.values,
              commercialTaxesUsed: values.commercialTaxesUsed,
            }),
          }
        : undefined;

      const finalOrder:
        | (INewOrderFormData & Omit<IOrderSummarySection, 'unlockOverrides'>)
        | undefined = values.final
        ? {
            ...values.final,
            lineItems: values.final.lineItems?.length
              ? values.final.lineItems.map(lineItem => ({
                  ...lineItem,
                  materialId: lineItem.materialId ?? null,
                }))
              : [],
            orderContactId:
              values.final.orderContactId === 0
                ? values.jobSiteContactId
                : values.final.orderContactId,
            customRatesGroupId:
              values.final.customRatesGroupId === 0 ||
              (values.final.noBillableService && !values.final.lineItems?.length)
                ? undefined
                : values.final.customRatesGroupId,
            materialProfileId:
              values.final.materialProfileId === 0 ? null : values.final.materialProfileId,
            driverInstructions: values.final.driverInstructions ?? '',
            grandTotal: getOrderTotal({
              order: values.final,
              businessLineId: values.businessLineId,
              region: i18nStore.region,
              taxDistricts: values.taxDistricts,
              surcharges: surchargeStore.values,
              commercialTaxesUsed: values.commercialTaxesUsed,
            }),
          }
        : undefined;

      return {
        ...values,
        recurrentTemplateData: recurrentOrder,
        delivery: deliveryOrder,
        final: finalOrder,
        businessUnitId,
        customerId,
        jobSiteId,
        projectId,
      };
    },
    [businessUnitId, customerId, i18nStore.region, jobSiteId, projectId, surchargeStore.values],
  );
};

export const useRecurrentOrderEditPayload = () => {
  const { jobSiteStore, customerStore, projectStore, surchargeStore, i18nStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  const jobSiteId = jobSiteStore.selectedEntity?.id;
  const customerId = customerStore.selectedEntity?.id;
  const projectId = projectStore.selectedEntity?.id;

  return useCallback(
    (values: INewRecurrentOrder): INewRecurrentOrder | null => {
      if (!jobSiteId || !customerId) {
        return null;
      }

      const recurrentOrder: IEditRecurrentOrderFormData & IOrderSummarySection = {
        ...values.recurrentTemplateData,
        ...formatTime(values.recurrentTemplateData),
        commercialTaxesUsed: values.commercialTaxesUsed,
        callOnWayPhoneNumber: values.recurrentTemplateData.callOnWayPhoneNumber ?? null,
        textOnWayPhoneNumber: values.recurrentTemplateData.textOnWayPhoneNumber ?? null,
        lineItems: values.recurrentTemplateData.lineItems?.length
          ? values.recurrentTemplateData.lineItems.map(lineItem => ({
              ...lineItem,
              materialId: lineItem.materialId ?? null,
            }))
          : undefined,
        orderContactId:
          values.recurrentTemplateData.orderContactId === 0
            ? values.jobSiteContactId
            : values.recurrentTemplateData.orderContactId,
        customRatesGroupId:
          values.recurrentTemplateData.customRatesGroupId === 0 ||
          (values.recurrentTemplateData.noBillableService &&
            !values.recurrentTemplateData.lineItems?.length)
            ? undefined
            : values.recurrentTemplateData.customRatesGroupId,
        materialProfileId:
          values.recurrentTemplateData.materialProfileId === 0
            ? null
            : values.recurrentTemplateData.materialProfileId,
        driverInstructions: values.recurrentTemplateData.driverInstructions,
        grandTotal: getOrderTotal({
          order: values.recurrentTemplateData,
          businessLineId: values.businessLineId,
          region: i18nStore.region,
          taxDistricts: values.taxDistricts,
          surcharges: surchargeStore.values,
          commercialTaxesUsed: values.commercialTaxesUsed,
        }),
        endDate: values.recurrentTemplateData?.endDate ?? null,
        customFrequencyType: values.recurrentTemplateData?.customFrequencyType ?? null,
        frequencyPeriod: values.recurrentTemplateData?.frequencyPeriod ?? null,
        oneTimePurchaseOrderNumber: values.recurrentTemplateData?.isOneTimePO
          ? values.recurrentTemplateData?.oneTimePurchaseOrderNumber
          : null,
      };

      return {
        ...values,
        ...recurrentOrder,
        businessUnitId,
        customerId,
        jobSiteId,
        projectId: projectId ?? null,
      };
    },
    [businessUnitId, customerId, i18nStore.region, jobSiteId, projectId, surchargeStore.values],
  );
};
