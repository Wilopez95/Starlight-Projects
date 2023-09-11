import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { Button, ISelectOption, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { omit } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { IOrderRatesCalculateRequest, OrderService } from '@root/api';
import {
  QuickViewConfirmModal,
  QuickViewContent,
  useQuickViewContext,
} from '@root/common/QuickView';
import { FormContainer } from '@root/components';
import { ConfirmModal } from '@root/components/modals';
import { NotificationHelper } from '@root/helpers';
import { useBoolean, useBusinessContext, useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { reactionReminderSchedule } from '@root/stores/reminder/helpers';
import { IConfigurableOrder } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import LeftPanel from '../components/OrderQuickViewLeftPanel/OrderQuickViewLeftPanel';
import { generateEditValidationSchema, getData } from '../helpers/orderFormikData';

import RightPanel from './RightPanel/RightPanel';
import { IOrderEditFormContainer } from './types';

const I18N_PATH = 'quickViews.OrderEdit.Text.';

const OrderEditFormContainer: React.FC<IOrderEditFormContainer> = ({ isDeferredPage }) => {
  const { orderStore, billableServiceStore, paymentStore, reminderStore, materialStore } =
    useStores();
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();
  const intl = useIntl();
  const { t } = useTranslation();
  const [billableServiceOptions, setBillableServiceOptions] = useState<ISelectOption[] | undefined>(
    [],
  );
  const [
    isMultipleOrdersConfirmModalOpen,
    openMultipleOrdersConfirmModal,
    closeMultipleOrdersConfirmModal,
  ] = useBoolean();

  const { businessUnitId } = useBusinessContext();

  const order = orderStore.selectedEntity!;

  const handleSubmit = useCallback(
    async (values: IConfigurableOrder) => {
      const response = await orderStore.edit({
        ...omit(values, 'values.annualReminderConfig'),
        businessLineId: values.businessLine ? values.businessLine.id : null,
        businessUnitId: businessUnitId ? Number(businessUnitId) : null,
        billableServiceId: values.billableService ? values.billableService.id : null,
        jobSiteId: order.jobSite ? order.jobSite.id : values.jobSiteId,
        customerId: order.customer ? order.customer.id : values.customerId,
        materialId: values.material ? values.material.id : null,
        equipmentItemId: values.equipmentItem ? values.equipmentItem.id : null,
        jobSiteContactId: values.jobSiteContactId
          ? values.jobSiteContactId
          : order.jobSiteContactId,
        jobSite2Id:
          values.billableService?.action === 'reposition' ? values.jobSiteId : values.jobSite2Id,
        orderContactId: values.orderContactId ? values.orderContactId : values.jobSiteContactId, //In case to use Job site contact them send the jobSiteContactId instead of orderContactId
        lineItems: values.lineItems?.length ? values.lineItems : null,
        customRatesGroupId: values.customRatesGroupId === 0 ? null : values.customRatesGroupId,
        materialProfileId: values.materialProfileId === 0 ? null : values.materialProfileId,
        driverInstructions: `${values.droppedEquipmentItemComment}${
          values.driverInstructions ?? ''
        }`,
        projectId: values.projectId ?? null,
        promoId: values.promoId ?? null,
        callOnWayPhoneNumberId: values.callOnWayPhoneNumberId ?? null,
        callOnWayPhoneNumber: values.callOnWayPhoneNumber ?? null,
        textOnWayPhoneNumberId: values.textOnWayPhoneNumberId ?? null,
        textOnWayPhoneNumber: values.textOnWayPhoneNumber ?? null,
        route: values.workOrder?.route,
        oneTimePurchaseOrderNumber: values.isOneTimePO ? values.oneTimePurchaseOrderNumber : null,
      });

      if (!response) {
        return;
      }

      if (values.annualReminderConfig) {
        await reactionReminderSchedule(
          {
            customerId: values.customerId,
            entityId: values.id,
            ...values.annualReminderConfig,
          },
          reminderStore,
        );
      }

      if (!orderStore.isPreconditionFailed || orderStore.isOrderStatusChanged) {
        if (isDeferredPage) {
          paymentStore.cleanup();
          paymentStore.requestDeferredByBU(+businessUnitId);
        } else {
          orderStore.requestDetails({
            orderId: order.id,
            edit: true,
            shouldOpenQuickView: true,
          });
        }

        forceCloseQuickView();
      }
    },
    [
      orderStore,
      reminderStore,
      isDeferredPage,
      forceCloseQuickView,
      paymentStore,
      businessUnitId,
      order.id,
    ],
  );

  const handleEdit = useCallback(
    (values: IConfigurableOrder) => {
      const deferredPayment = values.payments.find(
        ({ deferredUntil, status }) =>
          deferredUntil && (status === 'deferred' || status === 'failed'),
      );

      if (deferredPayment?.orders && deferredPayment.orders.length > 1) {
        openMultipleOrdersConfirmModal();
      } else {
        handleSubmit(values);
      }
    },
    [openMultipleOrdersConfirmModal, handleSubmit],
  );

  const initialValues = useMemo(() => {
    const orderData = reminderStore.currentReminderConfig
      ? {
          ...getData(order),
          annualReminderConfig: reminderStore.currentReminderConfig,
        }
      : getData(order);

    return {
      ...orderData,
      billableServiceOptions,
    };
  }, [billableServiceOptions, order, reminderStore.currentReminderConfig]);

  const formik = useFormik<IConfigurableOrder>({
    initialValues,
    validationSchema: generateEditValidationSchema(
      { billableServiceStore, materialStore },
      intl,
      t,
    ),
    onSubmit: handleEdit,
    enableReinitialize: true,
    validateOnChange: false,
  });

  const { values, errors, isSubmitting } = formik;

  useScrollOnError(errors, isSubmitting);

  const handleRequestRates = useCallback(
    async (lineItem?: { lineItemId: number; materialId?: number | null }, materialId?: number) => {
      const payload: IOrderRatesCalculateRequest = {
        businessUnitId: +businessUnitId,
        businessLineId: +values.businessLine.id,
        type: values.customRatesGroupId ? 'custom' : 'global',
        billableService: {
          billableServiceId: values.billableServiceId ?? undefined,
          equipmentItemId: values.equipmentItemId ?? undefined,
          materialId: values.billableService?.materialBasedPricing
            ? materialId ?? values.materialId
            : null,
        },
        billableLineItems: lineItem ? [lineItem] : undefined,
        customRatesGroupId: values.customRatesGroupId ?? undefined,
      };

      try {
        return await OrderService.calculateRates(payload);
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error(
          'calculateLineItemRates',
          typedError?.response?.code as ActionCode,
        );
        Sentry.addBreadcrumb({
          category: 'Order',
          message: `Order Rates Calculation Error ${JSON.stringify(typedError?.message)}`,
          data: {
            ...payload,
          },
        });
        Sentry.captureException(typedError);
      }

      return null;
    },
    [
      businessUnitId,
      values.businessLine.id,
      values.billableServiceId,
      values.billableService?.materialBasedPricing,
      values.equipmentItemId,
      values.customRatesGroupId,
      values.materialId,
    ],
  );

  const deferredPayment = values.payments.find(
    ({ deferredUntil, status }) => deferredUntil && (status === 'deferred' || status === 'failed'),
  );

  return (
    <>
      <ConfirmModal
        isOpen={isMultipleOrdersConfirmModalOpen}
        cancelButton="Cancel"
        submitButton="Save Changes"
        title="Multiple orders payment"
        subTitle={`Next orders ${(deferredPayment?.orders ?? [])
          .map(({ id }) => `#${id}`)
          .join(', ')} ${t(`${I18N_PATH}PaymentMethodMightBeUpdatedWell`)}`}
        onCancel={closeMultipleOrdersConfirmModal}
        onSubmit={() => handleSubmit(values)}
        nonDestructive
      />
      <FormContainer formik={formik} noValidate>
        <QuickViewContent
          dirty={formik.dirty}
          rightPanelElement={<RightPanel onRateRequest={handleRequestRates} />}
          leftPanelElement={
            <LeftPanel isEdit setBillableServiceOptions={setBillableServiceOptions} />
          }
          actionsElement={
            <Layouts.Flex justifyContent="space-between" alignItems="center">
              <Button variant="converseAlert" onClick={closeQuickView}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Layouts.Flex>
          }
          confirmModal={<QuickViewConfirmModal />}
        />
      </FormContainer>
    </>
  );
};

export default observer(OrderEditFormContainer);
