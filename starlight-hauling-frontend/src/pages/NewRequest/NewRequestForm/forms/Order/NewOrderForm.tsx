import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Button, ISelectOption, Layouts } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { get, noop, omit } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { JobSiteService } from '@root/api';
import { GlobalService } from '@root/api/global/global';
import { Protected, Shadow } from '@root/common';
import { FormContainer } from '@root/components';
import { ConfirmModal, PromptModal } from '@root/components/modals';
import {
  ClientRequestType,
  CustomerStatus,
  OrderStatusRoutes,
  Paths,
  SubscriptionTabRoutes,
  subscriptionTabStatus,
} from '@root/consts';
import { convertDates, mathRound2, pathToUrl } from '@root/helpers';
import { useBoolean, useBusinessContext, useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CustomerGroupType, SubscriptionOrderStatusEnum } from '@root/types';

import { BusinessLineAndService } from '../../components/selectors';
import { INewSubscriptionOrders } from '../Subscription/types';

import { generateOrderValidationSchema, getOrderValue } from './formikData';
import { getOrdersTotal } from './helpers';
import { useOrdersPayload } from './hooks';
import { JobSiteSection, OrderSection, PaymentSection, SummarySection } from './sections';
import { INewOrders, INewOrdersForm } from './types';
import { getDriverInstructionsTemplate } from './helpers/getDriverInstructions';

const requestLimit = 6;
const noBillableServicePath = 'orders[0].noBillableService';

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Order.Text.';

const NewOrderForm: React.FC<INewOrdersForm> = ({ commonValues, onOrdersChange }) => {
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const intl = useIntl();

  const { t } = useTranslation();

  const {
    jobSiteStore,
    customerStore,
    projectStore,
    orderStore,
    subscriptionStore,
    subscriptionOrderStore,
    materialStore,
    billableServiceStore,
    orderRequestStore,
    businessLineStore,
    surchargeStore,
    businessUnitStore,
    reminderStore,
    i18nStore,
  } = useStores();

  const backToOrdersRoute = pathToUrl(Paths.OrderModule.Orders, {
    businessUnit: businessUnitId,
    subPath: OrderStatusRoutes.InProgress,
  });

  const [isOrderRequestTotalModalOpen, showOrderRequestTotalModal, hideOrderRequestTotalModal] =
    useBoolean();
  const [isOverrideModalOpen, showOverrideModal, hideOverrideModal] = useBoolean();
  const [isLimitExceedModalOpen, showLimitExceedModal, hideLimitExceedModal] = useBoolean();
  const [isBestPaymentRemindModalOpen, showBestPaymentRemindModal, hideBestPaymentRemindModal] =
    useBoolean();

  const selectedJobSite = jobSiteStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;
  const selectedProject = projectStore.selectedEntity;

  const selectedOrderRequest = orderRequestStore.selectedEntity;

  const balances = selectedCustomer?.balances;

  const isCustomerInactive = selectedCustomer?.status === CustomerStatus.inactive;

  const isOverride = useRef<boolean>();
  const isOrderRequestTotalChanged = useRef<boolean>(false);
  const isBestPaymentApplied = useRef<boolean>(false);

  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [districtsLoaded, setDistrictsLoaded] = useState(false);

  const subscription = subscriptionStore.selectedEntity;
  let isSubscriptionOrderMode = false;

  const backToRoute = useMemo(
    () =>
      subscription
        ? pathToUrl(Paths.CustomerSubscriptionModule.Orders, {
            customerId: selectedCustomer?.id,
            businessUnit: businessUnitId,
            tab: subscriptionTabStatus.get(subscription.status) ?? SubscriptionTabRoutes.Active,
            subscriptionId: subscription.id,
          })
        : backToOrdersRoute,
    [subscription, selectedCustomer, businessUnitId, backToOrdersRoute],
  );

  useEffect(() => {
    if (selectedCustomer) {
      selectedCustomer.requestBalances();
    }
  }, [selectedCustomer, customerStore]);

  const currentBusinessUnit = useMemo(
    () => businessUnitStore.sortedValues.find(({ id }) => id === Number(businessUnitId)),
    [businessUnitId, businessUnitStore.sortedValues],
  );

  const orderValue = useMemo(
    () => getOrderValue(currentBusinessUnit, commonValues.purchaseOrderId),
    [currentBusinessUnit, commonValues.purchaseOrderId],
  );

  const handleCancel = useCallback(() => {
    history.push(backToRoute);
  }, [history, backToRoute]);

  const getOrdersPayload = useOrdersPayload();

  const handlePlace = useCallback(
    async (
      values: INewOrders | INewSubscriptionOrders,
      { setFieldError }: FormikHelpers<INewOrders | INewSubscriptionOrders>,
    ) => {
      const isSubscriptionOrderModeCheck = [
        ClientRequestType.SubscriptionOrder,
        ClientRequestType.SubscriptionNonService,
      ].includes(values.type);

      const ordersPayload = getOrdersPayload({
        ...values,
        serviceAreaId: commonValues.serviceAreaId,
      });

      if (!ordersPayload) {
        return;
      }

      setGrandTotal(ordersPayload.grandTotal);

      const activeStore = isSubscriptionOrderModeCheck ? subscriptionOrderStore : orderStore;

      let response;

      if (
        !isOrderRequestTotalChanged.current &&
        values.type === ClientRequestType.OrderRequest &&
        selectedOrderRequest &&
        selectedOrderRequest.grandTotal !== ordersPayload.grandTotal
      ) {
        showOrderRequestTotalModal();

        return;
      }

      if (isSubscriptionOrderModeCheck) {
        const defaultStatus =
          values.type === ClientRequestType.SubscriptionNonService
            ? SubscriptionOrderStatusEnum.completed
            : SubscriptionOrderStatusEnum.scheduled;

        response = await subscriptionOrderStore.create({
          ...omit(ordersPayload, 'payments'),
          status: defaultStatus,
          overrideCreditLimit: isOverride.current,
        } as INewSubscriptionOrders);
      } else {
        const paymentsSum = mathRound2(
          ordersPayload.payments.reduce((acc, cur) => acc + Number(cur.amount), 0),
        );
        const ordersSum = getOrdersTotal({
          orders: values.orders,
          businessLineId: values.businessLineId,
          region: i18nStore.region,
          taxDistricts: values.taxDistricts,
          surcharges: surchargeStore.values,
          commercialTaxesUsed: values.commercialTaxesUsed,
        });

        const customerMoney = -(balances?.balance ?? 0) - (balances?.prepaidOnAccount ?? 0);
        const availableCredit = balances?.availableCredit ?? 0;

        if (
          !isBestPaymentApplied.current &&
          values.payments.length === 1 &&
          values.payments[0].paymentMethod === 'onAccount' &&
          customerMoney > 0 &&
          ordersSum > availableCredit
        ) {
          showBestPaymentRemindModal();

          return;
        }
        if (paymentsSum !== ordersSum) {
          setFieldError(
            'payments[0].amount',
            'Payments total sum is not equal to orders total sum',
          );

          return;
        }

        const onAccountPaymentIndex = ordersPayload.payments.findIndex(
          payment => payment.paymentMethod === 'onAccount',
        );

        if (onAccountPaymentIndex > -1 && isOverride.current) {
          ordersPayload.payments[onAccountPaymentIndex].overrideCreditLimit = true;
        }

        response = await orderStore.create(ordersPayload);
      }

      if (response?.id && values.annualReminderConfig?.date && selectedCustomer?.id) {
        await reminderStore.createReminderSchedule({
          customerId: selectedCustomer.id,
          entityId: response.id,
          ...values.annualReminderConfig,
        });
      }

      if (activeStore.paymentError) {
        if (selectedCustomer?.onAccount || isSubscriptionOrderModeCheck) {
          showOverrideModal();
        } else {
          showLimitExceedModal();
        }
      }

      if (response?.id) {
        history.push(backToRoute);
      }
    },
    [
      getOrdersPayload,
      commonValues.serviceAreaId,
      subscriptionOrderStore,
      orderStore,
      selectedOrderRequest,
      selectedCustomer?.id,
      selectedCustomer?.onAccount,
      showOrderRequestTotalModal,
      i18nStore.region,
      surchargeStore.values,
      balances?.balance,
      balances?.prepaidOnAccount,
      balances?.availableCredit,
      showBestPaymentRemindModal,
      reminderStore,
      showOverrideModal,
      showLimitExceedModal,
      history,
      backToRoute,
    ],
  );

  const initialValues = useMemo(
    () => ({ ...orderValue, ...commonValues }),
    [commonValues, orderValue],
  );

  const formik = useFormik<INewOrders>({
    initialValues,
    validationSchema: generateOrderValidationSchema(
      {
        materialStore,
        billableServiceStore,
        businessLineStore,
        surchargeStore,
        i18nStore,
      },
      intl,
      t,
    ),
    validateOnChange: false,
    initialErrors: {},
    onSubmit: handlePlace,
    onReset: noop,
    enableReinitialize: true,
  });

  const { values, setFieldValue, setFormikState, errors, isSubmitting } = formik;

  const getEquipmentItemsMaterialsOptionsForOrder = useCallback(
    async (order, index: number) => {
      if (order.equipmentItemId) {
        const materials = await materialStore.requestByEquipmentItem(
          (order.equipmentItemId as number) || 0,
          {
            activeOnly: true,
          },
        );
        const materialOptions: ISelectOption[] =
          materials?.map(material => ({
            label: material.description,
            value: material.id,
            hint: material.manifested ? 'Manifested' : '',
          })) ?? [];

        await setFieldValue(`orders[${index}].equipmentItemsMaterialsOptions`, materialOptions);
      }
    },
    [materialStore, setFieldValue],
  );

  const setEquipmentItemsMaterialsOptionsInOrders = useCallback(() => {
    initialValues.orders.map(getEquipmentItemsMaterialsOptionsForOrder);
  }, [initialValues.orders, getEquipmentItemsMaterialsOptionsForOrder]);

  useEffect(() => {
    setEquipmentItemsMaterialsOptionsInOrders();
  }, [initialValues, setEquipmentItemsMaterialsOptionsInOrders]);

  const { setFieldError: setFieldErrorNewRequestForm } = useFormikContext<INewOrders>();

  isSubscriptionOrderMode = [
    ClientRequestType.SubscriptionOrder,
    ClientRequestType.SubscriptionNonService,
  ].includes(values.type);

  useScrollOnError(errors, isSubmitting);

  const nonInvoicedTotal = balances?.nonInvoicedTotal ?? 0;

  useEffect(() => {
    if (errors.serviceAreaId) {
      setFieldErrorNewRequestForm('serviceAreaId', errors.serviceAreaId);
    }
  }, [errors.serviceAreaId, setFieldErrorNewRequestForm]);

  const ordersTotalProcessed = useMemo(
    () =>
      getOrdersTotal({
        orders: values.orders,
        businessLineId: values.businessLineId,
        region: i18nStore.region,
        taxDistricts: values.taxDistricts,
        surcharges: surchargeStore.values,
        commercialTaxesUsed: values.commercialTaxesUsed,
      }) + nonInvoicedTotal,
    [
      nonInvoicedTotal,
      surchargeStore.values,
      values.businessLineId,
      values.orders,
      values.taxDistricts,
      values.commercialTaxesUsed,
      i18nStore.region,
    ],
  );

  const hasNoBillableService = get(values, noBillableServicePath);
  useEffect(() => {
    if (
      selectedCustomer?.customerGroup &&
      values.taxDistricts?.filter(district => district.taxesPerCustomerType)?.length
    ) {
      setFieldValue(
        'commercialTaxesUsed',
        [CustomerGroupType.commercial, CustomerGroupType.walkUp].includes(
          selectedCustomer.customerGroup.type,
        ),
      );
    }
  }, [selectedCustomer, setFieldValue, values.taxDistricts]);

  useEffect(() => {
    if (
      hasNoBillableService === false &&
      (values.type === ClientRequestType.NonServiceOrder ||
        values.type === ClientRequestType.SubscriptionNonService)
    ) {
      setFieldValue(noBillableServicePath, true);
    }
  }, [setFieldValue, hasNoBillableService, values.type]);

  useEffect(() => {
    onOrdersChange(ordersTotalProcessed);
  }, [onOrdersChange, ordersTotalProcessed]);

  useEffect(() => {
    (async () => {
      await surchargeStore.request({ businessLineId: values.businessLineId, activeOnly: true });
    })();
  }, [setFieldValue, surchargeStore, values.businessLineId]);

  useEffect(() => {
    if (selectedCustomer?.id && selectedJobSite?.id && !isSubscriptionOrderMode) {
      projectStore.cleanup();

      (async () => {
        try {
          const pair = convertDates(
            await GlobalService.getJobSiteCustomerPair(selectedJobSite.id, selectedCustomer.id),
          );

          const driverInstructionsInitialValue = getDriverInstructionsTemplate(
            selectedCustomer,
            pair,
          );

          if (pair) {
            setFormikState(prevState => ({
              ...prevState,
              values: {
                ...prevState.values,
                customerJobSite: pair,
                customerJobSiteId: pair.id,
                popupNote: pair.popupNote ?? '',
                workOrderNote: pair.workOrderNotes ?? '',
                permitRequired: pair.permitRequired ?? false,
                alleyPlacement:
                  values.type === ClientRequestType.OrderRequest
                    ? prevState.values.alleyPlacement
                    : pair.alleyPlacement ?? false,
                cabOver: pair.cabOver ?? false,
                poRequired: pair.poRequired ?? false,
                signatureRequired: pair.signatureRequired ?? false,
                orders: prevState.values.orders.map(order => ({
                  ...order,
                  driverInstructions: order.driverInstructions ?? driverInstructionsInitialValue,
                })),
              },
            }));

            projectStore.request({
              customerJobSiteId: pair?.id,
              limit: requestLimit,
              currentOnly: true,
            });
          } else {
            setFormikState(prevState => ({
              ...prevState,
              values: {
                ...prevState.values,
                customerJobSiteId: null,
                permitRequired: selectedProject?.permitRequired ?? false,
                alleyPlacement:
                  values.type === ClientRequestType.OrderRequest
                    ? prevState.values.alleyPlacement
                    : selectedJobSite.alleyPlacement,
                cabOver: selectedJobSite.cabOver,
                poRequired: selectedCustomer.poRequired,
                signatureRequired: selectedCustomer.signatureRequired,
                orders: prevState.values.orders.map(order => ({
                  ...order,
                  driverInstructions: order.driverInstructions ?? driverInstructionsInitialValue,
                })),
              },
            }));
          }
        } catch {
          setFormikState(prevState => ({
            ...prevState,
            values: {
              ...prevState.values,
              customerJobSiteId: null,
              poRequired: selectedCustomer.poRequired,
              signatureRequired: selectedCustomer.signatureRequired,
            },
          }));
        }
      })();
    }
  }, [
    selectedCustomer,
    selectedJobSite,
    selectedProject?.permitRequired,
    isSubscriptionOrderMode,
    setFieldValue,
    setFormikState,
    projectStore,
    values.type,
    values.serviceAreaId,
    values.contractorId,
  ]);

  useEffect(() => {
    // if change serviceAreaId load taxDistricts again
    setDistrictsLoaded(false);
  }, [commonValues.serviceAreaId]);

  useEffect(() => {
    if (selectedCustomer?.id && selectedJobSite?.id && !districtsLoaded) {
      (async () => {
        try {
          const districts = await JobSiteService.getCustomerJobSiteAvailableDistricts(
            selectedCustomer.id,
            selectedJobSite.id,
          );

          setFieldValue('taxDistricts', districts.map(convertDates));
        } catch {
          setFieldValue('taxDistricts', []);
        } finally {
          setDistrictsLoaded(true);
        }
      })();
    }
  }, [
    districtsLoaded,
    selectedCustomer,
    selectedJobSite,
    setFieldValue,
    values.businessLineId,
    values.serviceAreaId,
    values.taxDistricts,
  ]);

  const handleOverrideCancel = useCallback(() => {
    hideOverrideModal();
    orderStore.cleanPaymentError();
  }, [orderStore, hideOverrideModal]);

  const handleOverrideConfirm = useCallback(() => {
    handleOverrideCancel();
    isOverride.current = true;
    formik.handleSubmit();
  }, [formik, handleOverrideCancel]);

  const handleOrderRequestModalCancel = useCallback(() => {
    hideOrderRequestTotalModal();
  }, [hideOrderRequestTotalModal]);

  const handleOrderRequestModalConfirm = useCallback(() => {
    hideOrderRequestTotalModal();
    isOrderRequestTotalChanged.current = true;
    formik.handleSubmit();
  }, [formik, hideOrderRequestTotalModal]);

  const handleSuggestBestPayment = useCallback(() => {
    const availableCredit = balances?.availableCredit ?? 0;
    const ordersSum = getOrdersTotal({
      orders: values.orders,
      businessLineId: values.businessLineId,
      region: i18nStore.region,
      taxDistricts: values.taxDistricts,
      commercialTaxesUsed: values.commercialTaxesUsed,
      surcharges: surchargeStore.values,
    });

    if (ordersSum <= availableCredit) {
      setFieldValue('payments', [
        {
          paymentMethod: 'onAccount',
          amount: ordersSum,
          sendReceipt: false,
          authorizeCard: false,
        },
      ]);
    } else {
      const payments = [];

      if (availableCredit > 0) {
        payments.push({
          paymentMethod: 'onAccount',
          amount: availableCredit,
          sendReceipt: false,
          authorizeCard: false,
        });
      }

      const prepaidAmount = +(ordersSum - availableCredit).toFixed(2);

      payments.push({
        paymentMethod: 'creditCard',
        amount: availableCredit > 0 ? prepaidAmount : ordersSum,
        sendReceipt: false,
        authorizeCard: true,
      });

      setFieldValue('payments', payments);
      isBestPaymentApplied.current = true;
    }
  }, [
    balances?.availableCredit,
    values.orders,
    values.businessLineId,
    values.taxDistricts,
    values.commercialTaxesUsed,
    surchargeStore.values,
    i18nStore.region,
    setFieldValue,
  ]);

  const handleBestPaymentModalConfirm = useCallback(() => {
    handleSuggestBestPayment();
    hideBestPaymentRemindModal();
  }, [handleSuggestBestPayment, hideBestPaymentRemindModal]);

  const handleBestPaymentModalCancel = useCallback(() => {
    hideBestPaymentRemindModal();
    isBestPaymentApplied.current = true;
  }, [hideBestPaymentRemindModal]);

  const handleRejectOrderRequest = useCallback(async () => {
    if (values.orderRequestId) {
      await orderRequestStore.rejectById(values.orderRequestId);
      const url = pathToUrl(Paths.OrderModule.OrderRequests, {
        businessUnit: businessUnitId,
      });

      history.push(url);
    }
  }, [businessUnitId, history, orderRequestStore, values.orderRequestId]);

  const placeNewTitle = (): string => {
    switch (values.type) {
      case ClientRequestType.RegularOrder:
        return 'Place New Regular Order';
      case ClientRequestType.NonServiceOrder:
        return 'Place New Non-service Order';
      case ClientRequestType.RentalOrder:
        return 'Place New Rental Order';
      case ClientRequestType.SubscriptionOrder:
        return 'Link New Subscription Order';
      case ClientRequestType.SubscriptionNonService:
        return 'Link New Subscription Non-service Order';
      case ClientRequestType.OrderRequest:
        return 'Confirm Order';
      default:
        return 'Place New Service';
    }
  };

  return (
    <>
      <Protected
        permissions="orders:override-credit-limit:perform"
        fallback={
          <ConfirmModal
            isOpen={isOverrideModalOpen}
            cancelButton="Edit Order"
            title={t(`Titles.CreditOverlimit`)}
            subTitle="Looks like order total exceeded available credit limit. You have insufficient privileges to place this order."
            onCancel={handleOverrideCancel}
            nonDestructive
          />
        }
      >
        <ConfirmModal
          isOpen={isOverrideModalOpen}
          cancelButton="Edit Order"
          submitButton={t(`Text.OverrideLimit`)}
          title={t(`Titles.CreditOverlimit`)}
          subTitle="Looks like order total exceeded available credit limit. Are you sure want to place this order and exceed the limit?"
          onCancel={handleOverrideCancel}
          onSubmit={handleOverrideConfirm}
          nonDestructive
        />
        <ConfirmModal
          isOpen={isOrderRequestTotalModalOpen}
          cancelButton={t('Text.Cancel')}
          submitButton={t(`${I18N_PATH}SaveOrder`)}
          title={t(`${I18N_PATH}PriceMismatchTitle`)}
          subTitle={t(`${I18N_PATH}PriceMismatchMessage`, {
            actualTotal: intl.formatCurrency(grandTotal),
            orderRequestTotal: intl.formatCurrency(selectedOrderRequest?.grandTotal),
          })}
          onCancel={handleOrderRequestModalCancel}
          onSubmit={handleOrderRequestModalConfirm}
          nonDestructive
        />
      </Protected>
      <ConfirmModal
        isOpen={isBestPaymentRemindModalOpen}
        cancelButton="Edit Order"
        submitButton="Suggest Best Payment"
        title="Not Enough Amount"
        subTitle="Looks like order(s) total exceeded added payment. Please use the best payment option or update order payment manually."
        onCancel={handleBestPaymentModalCancel}
        onSubmit={handleBestPaymentModalConfirm}
        nonDestructive
      />

      <PromptModal
        isOpen={isLimitExceedModalOpen}
        submitButton="Edit Order"
        title={t(`Titles.CreditOverlimit`)}
        subTitle="Looks like order total exceeded available credit limit. Please select a different payment method."
        onSubmit={hideLimitExceedModal}
      />
      <BusinessLineAndService />
      <FormContainer formik={formik} noValidate>
        <JobSiteSection />
        <OrderSection serviceAreaId={commonValues.serviceAreaId} />
        <SummarySection
          isSubscriptionOrderType={isSubscriptionOrderMode}
          onSuggestBestPayment={handleSuggestBestPayment}
        />
        {!isSubscriptionOrderMode ? <PaymentSection /> : null}
        <Shadow variant="default">
          <Layouts.Box backgroundColor="white">
            <Layouts.Padding padding="3">
              <Layouts.Flex justifyContent="space-between">
                <Button type="reset" onClick={handleCancel}>
                  Cancel
                </Button>
                <Layouts.Flex>
                  {values.type === ClientRequestType.OrderRequest ? (
                    <Layouts.Margin right="3">
                      <Button
                        loading={orderRequestStore.loading}
                        onClick={handleRejectOrderRequest}
                      >
                        Reject
                      </Button>
                    </Layouts.Margin>
                  ) : null}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isCustomerInactive}
                    loading={orderStore.loading}
                  >
                    {placeNewTitle()}
                  </Button>
                </Layouts.Flex>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Box>
        </Shadow>
      </FormContainer>
    </>
  );
};

export default observer(NewOrderForm);
