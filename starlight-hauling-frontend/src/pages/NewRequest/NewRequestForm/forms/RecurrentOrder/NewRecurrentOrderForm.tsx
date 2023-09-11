import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Layouts } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { JobSiteService } from '@root/api';
import { GlobalService } from '@root/api/global/global';
import { Protected, Shadow } from '@root/common';
import { FormContainer } from '@root/components';
import { ConfirmModal, PromptModal } from '@root/components/modals';
import { ClientRequestType, CustomerStatus, OrderStatusRoutes, Paths } from '@root/consts';
import { convertDates, pathToUrl } from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  useCleanup,
  usePermission,
  useScrollOnError,
  useStores,
} from '@root/hooks';
import { CustomerGroupType } from '@root/types';

import { BusinessLineAndService } from '../../components/selectors';

import { generateOrderValidationSchema, getRecurrentOrderValue } from './formikData';
import { getOrderTotal } from './helpers';
import { useRecurrentOrderEditPayload, useRecurrentOrderPayload } from './hooks';
import { JobSiteSection, OrderSection, PaymentSection, SummarySection } from './sections';
import { INewRecurrentOrder, INewRecurrentOrderForm } from './types';

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.RecurrentOrder.NewRecurrentOrderForm.';
const NewRecurrentOrderForm: React.FC<INewRecurrentOrderForm> = ({
  commonValues,
  onOrdersChange,
}) => {
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const {
    jobSiteStore,
    customerStore,
    projectStore,
    recurrentOrderStore,
    materialStore,
    billableServiceStore,
    surchargeStore,
    businessUnitStore,
    i18nStore,
  } = useStores();

  const { orderId } = useParams<{ orderId: string }>();
  const isOverride = useRef<boolean>();

  const isOrderEdit = !!orderId;

  const [isOverrideModalOpen, showOverrideModal, hideOverrideModal] = useBoolean();
  const [isLimitExceedModalOpen, showLimitExceedModal, hideLimitExceedModal] = useBoolean();

  const selectedJobSite = jobSiteStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;
  const selectedProject = projectStore.selectedEntity;

  useCleanup(recurrentOrderStore);

  const jobSiteAndCustomerAreSelected = selectedJobSite && selectedCustomer;

  const backToOrdersRoute = pathToUrl(Paths.OrderModule.Orders, {
    businessUnit: businessUnitId,
    subPath: OrderStatusRoutes.InProgress,
  });

  const backToRecurrentOrdersRoute = pathToUrl(Paths.CustomerRecurrentOrderModule.Orders, {
    businessUnit: businessUnitId,
    customerId: selectedCustomer?.id,
  });

  useEffect(() => {
    if (selectedCustomer) {
      selectedCustomer.requestBalances();
    }
  }, [selectedCustomer, customerStore]);

  const handleCancel = useCallback(() => {
    history.push(backToOrdersRoute);
  }, [history, backToOrdersRoute]);

  const getRecurrentOrderPayload = useRecurrentOrderPayload();
  const getRecurrentOrderEditPayload = useRecurrentOrderEditPayload();

  const currentBusinessUnit = useMemo(
    () => businessUnitStore.sortedValues.find(({ id }) => id === Number(businessUnitId)),
    [businessUnitId, businessUnitStore.sortedValues],
  );

  const canPlaceNewOrders = usePermission('orders:new-order:perform');
  const canEditOrders = usePermission('orders:edit:perform');
  const canPlaceOnAccountForOnHold = usePermission('orders:new-on-account-on-hold-order:perform');
  const canPlaceOrder =
    canPlaceOnAccountForOnHold || selectedCustomer?.status !== CustomerStatus.onHold;

  const canPerformCurrentAction = isOrderEdit ? canEditOrders : canPlaceNewOrders && canPlaceOrder;

  const handlePlace = useCallback(
    async (values: INewRecurrentOrder, { setFieldError }: FormikHelpers<INewRecurrentOrder>) => {
      const recurrentOrderPayload = isOrderEdit
        ? getRecurrentOrderEditPayload(values)
        : getRecurrentOrderPayload({ ...values, serviceAreaId: commonValues.serviceAreaId });

      if (!recurrentOrderPayload) {
        return;
      }
      const paymentsSum = recurrentOrderPayload.payment.amount;

      const deliveryOrderSum = values.delivery
        ? getOrderTotal({
            order: values.delivery,
            businessLineId: values.businessLineId,
            region: i18nStore.region,
            taxDistricts: values.taxDistricts,
            surcharges: surchargeStore.values,
            commercialTaxesUsed: values.commercialTaxesUsed,
          })
        : 0;

      const recurrentOrderSum = getOrderTotal({
        order: values.recurrentTemplateData,
        businessLineId: values.businessLineId,
        region: i18nStore.region,
        taxDistricts: values.taxDistricts,
        surcharges: surchargeStore.values,
        commercialTaxesUsed: values.commercialTaxesUsed,
      });

      const finalOrderSum = values.final
        ? getOrderTotal({
            order: values.final,
            businessLineId: values.businessLineId,
            region: i18nStore.region,
            taxDistricts: values.taxDistricts,
            surcharges: surchargeStore.values,
            commercialTaxesUsed: values.commercialTaxesUsed,
          })
        : 0;

      const ordersSum = deliveryOrderSum + recurrentOrderSum + finalOrderSum;

      if (paymentsSum !== ordersSum) {
        return setFieldError(
          'payment.amount',
          'Payments total sum is not equal to orders total sum',
        );
      }

      if (isOverride.current) {
        recurrentOrderPayload.overrideCreditLimit = true;
      }

      let response;

      if (!isOrderEdit) {
        response = await recurrentOrderStore.create(recurrentOrderPayload);
      } else {
        response = await recurrentOrderStore.update(+orderId, recurrentOrderPayload);
      }

      if (recurrentOrderStore.paymentError) {
        if (selectedCustomer?.onAccount) {
          showOverrideModal();
        } else {
          showLimitExceedModal();
        }
      }

      if (response?.id) {
        history.push(isOrderEdit ? backToRecurrentOrdersRoute : backToOrdersRoute);
      }
    },
    [
      isOrderEdit,
      getRecurrentOrderEditPayload,
      getRecurrentOrderPayload,
      commonValues.serviceAreaId,
      i18nStore.region,
      surchargeStore.values,
      recurrentOrderStore,
      orderId,
      selectedCustomer?.onAccount,
      showOverrideModal,
      showLimitExceedModal,
      history,
      backToRecurrentOrdersRoute,
      backToOrdersRoute,
    ],
  );

  const recurrentOrderValue = getRecurrentOrderValue(
    currentBusinessUnit?.applySurcharges ?? true,
    commonValues.purchaseOrderId,
  );

  const formik = useFormik<INewRecurrentOrder>({
    initialValues: { ...recurrentOrderValue, ...commonValues },
    validationSchema: generateOrderValidationSchema(
      {
        materialStore,
        billableServiceStore,
        surchargeStore,
        i18nStore,
      },
      t,
    ),
    validateOnChange: false,
    initialErrors: {},
    onSubmit: handlePlace,
    onReset: handleCancel,
  });

  const { values, setFieldValue, setFormikState, errors, isSubmitting } = formik;

  const { setFieldError: setFieldErrorNewRequestForm } = useFormikContext<INewRecurrentOrder>();

  useScrollOnError(errors, isSubmitting);

  const nonInvoicedTotal = selectedCustomer?.balances?.nonInvoicedTotal ?? 0;

  useEffect(() => {
    if (errors.serviceAreaId) {
      setFieldErrorNewRequestForm('serviceAreaId', errors.serviceAreaId);
    }
  }, [errors.serviceAreaId, setFieldErrorNewRequestForm]);

  useEffect(() => {
    if (
      selectedCustomer?.customerGroup &&
      !isOrderEdit &&
      values.taxDistricts?.filter(district => district.taxesPerCustomerType)?.length
    ) {
      setFieldValue(
        'commercialTaxesUsed',
        [CustomerGroupType.commercial, CustomerGroupType.walkUp].includes(
          selectedCustomer.customerGroup.type,
        ),
      );
    }
  }, [selectedCustomer, setFieldValue, isOrderEdit, values.taxDistricts]);

  const ordersTotalProcessed = useMemo(
    () =>
      getOrderTotal({
        order: values.recurrentTemplateData,
        businessLineId: values.businessLineId,
        region: i18nStore.region,
        taxDistricts: values.taxDistricts,
        surcharges: surchargeStore.values,
        commercialTaxesUsed: values.commercialTaxesUsed,
      }) + nonInvoicedTotal,
    [
      i18nStore.region,
      nonInvoicedTotal,
      surchargeStore.values,
      values.businessLineId,
      values.recurrentTemplateData,
      values.taxDistricts,
      values.commercialTaxesUsed,
    ],
  );

  useEffect(() => {
    onOrdersChange(ordersTotalProcessed);
  }, [onOrdersChange, ordersTotalProcessed]);

  useEffect(() => {
    setFieldValue('serviceAreaId', commonValues.serviceAreaId);
  }, [commonValues.serviceAreaId, setFieldValue]);

  useEffect(() => {
    surchargeStore.request({ businessLineId: values.businessLineId });
  }, [setFieldValue, surchargeStore, values.businessLineId]);

  useLayoutEffect(() => {
    if (!isOrderEdit) {
      setFieldValue('serviceAreaId', undefined);
    }
  }, [values.businessLineId, setFieldValue, isOrderEdit]);

  useEffect(() => {
    if (selectedCustomer?.id && selectedJobSite?.id) {
      (async () => {
        try {
          const pair = convertDates(
            await GlobalService.getJobSiteCustomerPair(selectedJobSite.id, selectedCustomer.id),
          );

          if (pair) {
            setFormikState(prevState => ({
              ...prevState,
              values: {
                ...prevState.values,
                customerJobSiteId: pair.id,
                pair: {
                  popupNote: pair.popupNote ?? '',
                  workOrderNote: pair.workOrderNotes ?? '',
                  permitRequired: pair.permitRequired ?? false,
                  alleyPlacement: pair.alleyPlacement ?? false,
                  cabOver: pair.cabOver ?? false,
                  poRequired: pair.poRequired ?? false,
                  signatureRequired: pair.signatureRequired ?? false,
                },
              },
            }));
          } else {
            setFormikState(prevState => ({
              ...prevState,
              values: {
                ...prevState.values,
                customerJobSiteId: null,
                pair: {
                  permitRequired: selectedProject?.permitRequired ?? false,
                  alleyPlacement: selectedJobSite.alleyPlacement,
                  cabOver: selectedJobSite.cabOver,
                  poRequired: selectedCustomer.poRequired,
                  signatureRequired: selectedCustomer.signatureRequired,
                  popupNote: '',
                  workOrderNote: '',
                },
              },
            }));
          }
        } catch {
          setFormikState(prevState => ({
            ...prevState,
            values: {
              ...prevState.values,
              customerJobSiteId: null,
              pair: {
                ...prevState.values.pair,
                poRequired: selectedCustomer.poRequired,
                signatureRequired: selectedCustomer.signatureRequired,
              },
            },
          }));
        }
      })();
    }
  }, [
    selectedCustomer,
    selectedJobSite,
    selectedProject?.permitRequired,
    setFieldValue,
    setFormikState,
    projectStore,
  ]);

  useEffect(() => {
    if (selectedCustomer?.id && selectedJobSite?.id) {
      (async () => {
        try {
          const districts = await JobSiteService.getCustomerJobSiteAvailableDistricts(
            selectedCustomer.id,
            selectedJobSite.id,
          );

          setFieldValue('taxDistricts', districts.map(convertDates));
        } catch {
          setFieldValue('taxDistricts', []);
        }
      })();
    }
  }, [selectedCustomer, selectedJobSite, setFieldValue, values.businessLineId]);

  const handleOverrideCancel = useCallback(() => {
    hideOverrideModal();
    recurrentOrderStore.cleanPaymentError();
  }, [recurrentOrderStore, hideOverrideModal]);

  const handleOverrideConfirm = useCallback(() => {
    handleOverrideCancel();
    isOverride.current = true;
    formik.handleSubmit();
  }, [formik, handleOverrideCancel]);

  return (
    <>
      <Protected
        permissions="orders:override-credit-limit:perform"
        fallback={
          <ConfirmModal
            isOpen={isOverrideModalOpen}
            cancelButton={t(`${I18N_PATH}EditOrder`)}
            title={t('Titles.CreditOverlimit')}
            subTitle={t(`${I18N_PATH}OverrideSubtitleInsufficientPrivileges`)}
            onCancel={handleOverrideCancel}
            nonDestructive
          />
        }
      >
        <ConfirmModal
          isOpen={isOverrideModalOpen}
          cancelButton={t(`${I18N_PATH}EditOrder`)}
          submitButton={t('Text.OverrideLimit')}
          title={t('Titles.CreditOverlimit')}
          subTitle={t(`${I18N_PATH}OverrideSubtitle`)}
          onCancel={handleOverrideCancel}
          onSubmit={handleOverrideConfirm}
          nonDestructive
        />
      </Protected>
      <PromptModal
        isOpen={isLimitExceedModalOpen}
        submitButton={t(`${I18N_PATH}EditOrder`)}
        title={t('Titles.CreditOverlimit')}
        subTitle={t(`${I18N_PATH}CreditOverlimitSubtitle`)}
        onSubmit={hideLimitExceedModal}
      />
      <BusinessLineAndService readOnly={isOrderEdit} />
      <FormContainer formik={formik} noValidate>
        {jobSiteAndCustomerAreSelected &&
        !!values.businessLineId &&
        values.type !== ClientRequestType.Unknown ? (
          <>
            <JobSiteSection />
            {values.delivery ? (
              <OrderSection basePath="delivery" serviceAreaId={commonValues.serviceAreaId} />
            ) : null}
            {values.recurrentTemplateData ? (
              <OrderSection
                basePath="recurrentTemplateData"
                serviceAreaId={commonValues.serviceAreaId}
                orderData={values.recurrentTemplateData}
              />
            ) : null}
            {values.final ? (
              <OrderSection basePath="final" serviceAreaId={commonValues.serviceAreaId} />
            ) : null}
            <SummarySection />
            <PaymentSection />
            <Shadow variant="default">
              <Layouts.Box backgroundColor="white">
                <Layouts.Padding padding="3">
                  <Layouts.Flex justifyContent="space-between">
                    <Button type="reset">{t('Text.Cancel')}</Button>
                    <Layouts.Flex>
                      {canPerformCurrentAction ? (
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={recurrentOrderStore.loading}
                        >
                          {isOrderEdit
                            ? t(`${I18N_PATH}UpdateRecurrentOrder`)
                            : t(`${I18N_PATH}PlaceNewRecurrentOrder`)}
                        </Button>
                      ) : null}
                    </Layouts.Flex>
                  </Layouts.Flex>
                </Layouts.Padding>
              </Layouts.Box>
            </Shadow>
          </>
        ) : null}
      </FormContainer>
    </>
  );
};

export default observer(NewRecurrentOrderForm);
