import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import {
  Calendar,
  Checkbox,
  ISelectOption,
  ISelectOptionGroup,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { endOfToday, isPast, isSameDay } from 'date-fns';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Banner, FormInput, Section, Subsection, Typography } from '@root/common';
import { OrderTimePicker } from '@root/components';
import { IContactFormData } from '@root/components/forms/NewContact/types';
import ReminderForm from '@root/components/forms/ReminderConfigurationForm/components/ReminderForm/ReminderForm';
import { NewContactModal } from '@root/components/modals';
import PurchaseOrderSelect from '@root/components/PurchaseOrderSelect/PurchaseOrderSelect';
import {
  BillingCycleEnum,
  billingCyclesOptions,
  billingTypesOptions,
  BusinessLineType,
  Routes,
} from '@root/consts';
import { getGlobalPriceType } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import {
  useBusinessContext,
  useFetchAndCreatePONumbers,
  usePrevious,
  useStores,
  useToggle,
  useUserContext,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { getBillingPeriod } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/helpers/getBillingPeriodValidation';
import { useHandleSelectRatesChange } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/hooks/useHandleSelectRatesChange';
import {
  INewSubscription,
  INewSubscriptionFormParams,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { SubscriptionStatusEnum } from '@root/types';

import { ServiceItems } from '../ServiceItems/ServiceItems';

import DailyRoutesNotification from './components/DailyRoutesNotification/DailyRoutesNotification';
import WOChangedNotification from './components/WOChangedNotification/WOChangedNotification';
import { ContactFieldFooter } from './components';
import { IOrderSection } from './types';

const hasPermits = [BusinessLineType.rollOff, BusinessLineType.portableToilets];
const today = endOfToday();
const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.Text.';

const OrderSection: React.FC<IOrderSection> = ({ isSubscriptionClosed, isClone }) => {
  const {
    billableServiceStore,
    lineItemStore,
    equipmentItemStore,
    brokerStore,
    disposalSiteStore,
    contactStore,
    customerStore,
    globalRateStore,
    thirdPartyHaulerStore,
    materialProfileStore,
    permitStore,
    businessLineStore,
    subscriptionStore,
    subscriptionDraftStore,
  } = useStores();

  const [billingPeriodWarning, setMinimumBillingPeriodWarning] = useState<string | null>(null);

  const [isNewContactModalOpen, toggleIsNewContactModalOpen] = useToggle();

  const { currentUser } = useUserContext();
  const { entity: entityParam } = useParams<INewSubscriptionFormParams>();
  const { businessUnitId } = useBusinessContext();
  const subscription = subscriptionStore.selectedEntity ?? subscriptionDraftStore.selectedEntity;
  const { t } = useTranslation();
  const { dateFormat } = useDateIntl();
  const { firstDayOfWeek } = useIntl();

  const isSubscriptionEdit = entityParam === Routes.Subscription && !isClone;
  const isSubscriptionDraftEdit = entityParam === Routes.SubscriptionDraft;

  const isCSR = currentUser?.email === subscription?.csrEmail;
  const isSalesRep = currentUser?.id === subscription?.customer.salesId;

  const selectedCustomer = customerStore.selectedEntity;

  const { values, errors, handleChange, setFieldValue } = useFormikContext<INewSubscription>();
  if (isSubscriptionDraftEdit) {
    values.csrComment = subscription?.csrComment ? subscription?.csrComment : undefined;
    values.orderContactId = subscription?.subscriptionContact?.id
      ? subscription?.subscriptionContact?.id
      : 0;
    values.jobSiteContactId = subscription?.jobSiteContact?.id
      ? subscription?.jobSiteContact?.id
      : 0;
    values.thirdPartyHaulerId = subscription?.thirdPartyHauler?.id
      ? subscription?.thirdPartyHauler?.id
      : 0;
  }

  const prevBillingCycle = usePrevious(values.billingCycle);

  useHandleSelectRatesChange();

  useEffect(() => {
    permitStore.cleanup();

    equipmentItemStore.request({ businessLineId: values.businessLineId, activeOnly: true });
    brokerStore.request();
    disposalSiteStore.request({ activeOnly: true });
    thirdPartyHaulerStore.request({ activeOnly: true });
    permitStore.request({
      businessUnitId,
      businessLineId: values.businessLineId?.toString() ?? undefined,
      activeOnly: true,
      excludeExpired: true,
    });
    materialProfileStore.request({
      activeOnly: true,
      disposals: true,
      businessLineId: values.businessLineId,
    });
    businessLineStore.request();
    businessLineStore.getBLByBUId(+businessUnitId, { activeOnly: true });

    if (selectedCustomer) {
      contactStore.requestByCustomer({ customerId: selectedCustomer.id, activeOnly: true });
    }
  }, [
    brokerStore,
    equipmentItemStore,
    disposalSiteStore,
    contactStore,
    customerStore.selectedEntity,
    selectedCustomer,
    thirdPartyHaulerStore,
    materialProfileStore,
    permitStore,
    businessUnitId,
    values.businessLineId,
    businessLineStore,
  ]);

  // This looks hacky, but we need to set correct billing cycle and type in an mount and then while it is updating, to make API calls
  useEffect(() => {
    if (!values.billingType) {
      const businessUnitCycle = businessLineStore.values?.find(
        businessLine => businessLine.id === +values.businessLineId,
      );

      setFieldValue('billingType', businessUnitCycle?.billingType);
      if (selectedCustomer?.billingCycle) {
        setFieldValue('billingCycle', selectedCustomer?.billingCycle);
      } else {
        setFieldValue('billingCycle', businessUnitCycle?.billingCycle);
      }
    }
  }, [
    businessLineStore.values,
    selectedCustomer?.billingCycle,
    setFieldValue,
    values.billingType,
    values.businessLineId,
  ]);

  useEffect(() => {
    if (prevBillingCycle && prevBillingCycle !== values.billingCycle) {
      billableServiceStore.cleanup();
      lineItemStore.cleanup();

      billableServiceStore.request({
        businessLineId: values.businessLineId,
        activeOnly: true,
        billingCycle: values.billingCycle,
      });
      lineItemStore.request({
        businessLineId: values.businessLineId,
        oneTime: false,
        activeOnly: true,
        billingCycle: values.billingCycle,
      });
    }
  }, [
    billableServiceStore,
    lineItemStore,
    prevBillingCycle,
    values.billingCycle,
    values.businessLineId,
  ]);

  const businessLineType = businessLineStore.getById(values.businessLineId)?.type;
  const handleNewContactFormSubmit = useCallback(
    (newValues: IContactFormData) => {
      newValues.phoneNumbers?.forEach(phoneNumber => {
        if (phoneNumber.id === 0) {
          delete phoneNumber.id;
        }
      });

      if (selectedCustomer) {
        contactStore.create(
          {
            ...newValues,
            active: true,
            customerId: newValues.temporaryContact ? undefined : selectedCustomer.id,
            main: false,
          },
          businessUnitId,
        );
      }
      toggleIsNewContactModalOpen();
    },
    [contactStore, selectedCustomer, toggleIsNewContactModalOpen, businessUnitId],
  );

  useEffect(() => {
    let warning = null;

    if (values.billingCycle && values.startDate && values.endDate) {
      const billingPeriod = getBillingPeriod({
        billingCycle: values.billingCycle,
        startDate: values.startDate,
        endDate: values.endDate,
        anniversaryBilling: values.anniversaryBilling,
      });

      if (billingPeriod && billingPeriod.billingPeriodsArr.length < values.minBillingPeriods!) {
        warning = t(`${I18N_PATH}DurationOfTheSubscription`);
      }
    }
    setMinimumBillingPeriodWarning(warning);
  }, [
    values.minBillingPeriods,
    values.billingCycle,
    values.anniversaryBilling,
    values.endDate,
    values.startDate,
    t,
  ]);

  const handleDateChange = useCallback(
    (name: string, date: Date | null) => {
      setFieldValue(name, date ?? undefined);
    },
    [setFieldValue],
  );

  const contactOptions: ISelectOptionGroup[] = useMemo(
    () => [
      {
        options: [
          {
            label: 'Use job site contact',
            value: 0,
          },
          ...contactStore.values.map(contact => ({
            label: contact.name,
            value: contact.id,
            hint: contact.jobTitle ?? '',
          })),
        ],
        footer: <ContactFieldFooter />,
        onFooterClick: toggleIsNewContactModalOpen,
      },
    ],
    [contactStore.values, toggleIsNewContactModalOpen],
  );

  const getPriceGroupOptions = useCallback((): ISelectOption[] => {
    const options = [
      {
        label: globalRateStore.values[0].description,
        value: globalRateStore.values[0].id,
        hint: getGlobalPriceType(t),
      },
      ...values.customRatesGroupOptions,
    ];

    return options;
  }, [globalRateStore.values, t, values.customRatesGroupOptions]);

  const thirdPartyHaulerOptions: ISelectOption[] = useMemo(
    () =>
      thirdPartyHaulerStore.sortedValues
        .filter(option => option.active)
        .map(hauler => ({
          label: hauler.description,
          value: hauler.id,
        })),
    [thirdPartyHaulerStore.sortedValues],
  );
  const permitOptions: ISelectOption[] = useMemo(
    () =>
      permitStore.sortedValues.map(permit => ({
        value: permit.id,
        label: permit.number,
      })),
    [permitStore.sortedValues],
  );

  const annualEventReminderConditions = useMemo(
    () =>
      !isSubscriptionEdit ||
      !isSubscriptionDraftEdit ||
      ((isCSR || isSalesRep) && !SubscriptionStatusEnum.Closed),
    [isSubscriptionEdit, isSubscriptionDraftEdit, isCSR, isSalesRep],
  );

  const { purchaseOrderOptions, handleCreatePurchaseOrder } = useFetchAndCreatePONumbers({
    customerId: selectedCustomer?.id,
    selectedPurchaseOrders: values.purchaseOrder ? [values.purchaseOrder] : [],
  });

  // there is no sense for this form part without LoB
  if (!businessLineType) {
    return null;
  }

  const priceGroupOptions = getPriceGroupOptions();

  return (
    <>
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onFormSubmit={handleNewContactFormSubmit}
        onClose={toggleIsNewContactModalOpen}
      />

      <Section>
        <Subsection>
          <Layouts.Margin bottom="1">
            <Layouts.Flex justifyContent="space-between">
              <Typography variant="headerThree">{t(`${I18N_PATH}SubscriptionDetails`)}</Typography>
            </Layouts.Flex>
          </Layouts.Margin>
          <Layouts.Flex>
            <Layouts.Column>
              <Select
                label={`${t(`${I18N_PATH}SubscriptionContact`)}*`}
                placeholder={t(`${I18N_PATH}SelectContact`)}
                name="orderContactId"
                options={contactOptions}
                value={values.orderContactId}
                error={errors.orderContactId}
                onSelectChange={setFieldValue}
                disabled={isSubscriptionClosed}
              />
              <PurchaseOrderSelect
                label={t(`${I18N_PATH}PurchaseOrderNumber`)}
                placeholder={t('Text.Select')}
                name="purchaseOrderId"
                options={purchaseOrderOptions}
                value={values.purchaseOrderId ?? ''}
                error={errors.purchaseOrderId}
                onSelectChange={setFieldValue}
                onCreatePurchaseOrder={handleCreatePurchaseOrder}
              />
              {hasPermits.includes(businessLineType) ? (
                <Select
                  placeholder={t(`${I18N_PATH}SelectPermit`)}
                  label={`${t(`${I18N_PATH}Permit`)}*`}
                  name="permitId"
                  options={permitOptions}
                  value={values.permitId}
                  error={errors.permitId}
                  onSelectChange={setFieldValue}
                  disabled={isSubscriptionClosed}
                />
              ) : null}

              <Select
                label={t(`${I18N_PATH}ThirdPartyHauler`)}
                placeholder={t(`${I18N_PATH}SelectHauler`)}
                name="thirdPartyHaulerId"
                value={values.thirdPartyHaulerId ?? 0}
                options={thirdPartyHaulerOptions}
                error={errors.thirdPartyHaulerId}
                onSelectChange={setFieldValue}
                disabled={isSubscriptionClosed}
              />

              <Select
                label={`${t(`${I18N_PATH}PriceGroup`)}*`}
                placeholder={t(`${I18N_PATH}SelectPriceGroup`)}
                name="customRatesGroupId"
                options={priceGroupOptions}
                value={values.customRatesGroupId}
                error={errors.customRatesGroupId}
                onSelectChange={setFieldValue}
              />
              <Select
                label={`${t(`${I18N_PATH}BillingType`)}*`}
                placeholder={t(`${I18N_PATH}SelectBillingType`)}
                name="billingType"
                options={billingTypesOptions}
                value={values.billingType}
                error={errors.billingType}
                disabled={isSubscriptionEdit}
                onSelectChange={setFieldValue}
                nonClearable
              />
              <Select
                label={`${t(`${I18N_PATH}BillingCycle`)}*`}
                placeholder={t(`${I18N_PATH}SelectBillingCycle`)}
                name="billingCycle"
                options={billingCyclesOptions}
                value={values.billingCycle}
                error={errors.billingCycle}
                disabled={isSubscriptionEdit}
                onSelectChange={setFieldValue}
              />
              {values.billingCycle !== BillingCycleEnum.daily &&
              values.billingCycle !== BillingCycleEnum._28days ? (
                <Checkbox
                  name="anniversaryBilling"
                  value={values.anniversaryBilling}
                  error={errors.anniversaryBilling}
                  onChange={handleChange}
                  disabled={isSubscriptionEdit}
                >
                  {t(`${I18N_PATH}AnniversaryBilling`)}
                </Checkbox>
              ) : null}
              <Layouts.Margin top="3">
                <FormInput
                  label={t(`${I18N_PATH}CSRComment`)}
                  placeholder={t(`${I18N_PATH}AddCommentFromCSR`)}
                  name="csrComment"
                  value={values.csrComment}
                  error={errors.csrComment}
                  onChange={handleChange}
                  disabled={isSubscriptionClosed}
                  area
                />
              </Layouts.Margin>
            </Layouts.Column>
            <Layouts.Column>
              <Calendar
                label={`${t(`${I18N_PATH}StartDate`)}*`}
                name="startDate"
                withInput
                value={values.startDate}
                placeholder={t('Text.SetDate')}
                firstDayOfWeek={firstDayOfWeek}
                dateFormat={dateFormat}
                error={errors.startDate}
                minDate={isSubscriptionEdit ? today : undefined}
                readOnly={
                  (isSubscriptionEdit &&
                    values.startDate &&
                    isPast(values.startDate) &&
                    !isSameDay(values.startDate, today)) ||
                  isSubscriptionClosed ||
                  !!values.invoicedDate
                }
                onDateChange={handleDateChange}
                disabled={isSubscriptionClosed ?? !!values.invoicedDate}
              />

              <Calendar
                label={t(`${I18N_PATH}EndDate`)}
                name="endDate"
                withInput
                value={values.endDate}
                placeholder={t('Text.SetDate')}
                firstDayOfWeek={firstDayOfWeek}
                dateFormat={dateFormat}
                minDate={values.startDate}
                error={errors.endDate}
                onDateChange={handleDateChange}
                readOnly={isSubscriptionClosed}
              />

              <Layouts.Margin top="1">
                <FormInput
                  type="number"
                  label={t(`${I18N_PATH}MinimumAmountOfBillingPeriods`)}
                  name="minBillingPeriods"
                  countable
                  value={values.minBillingPeriods}
                  error={errors.minBillingPeriods}
                  disabled={isSubscriptionEdit}
                  onChange={handleChange}
                  limits={{
                    min: 1,
                    max: 999,
                  }}
                />
              </Layouts.Margin>
              {billingPeriodWarning ? (
                <Layouts.Margin bottom="3">
                  <Banner>{billingPeriodWarning}</Banner>
                </Layouts.Margin>
              ) : null}
              {annualEventReminderConditions ? (
                <Layouts.Margin top="1">
                  <ReminderForm isAnnualReminder size="100%" />
                </Layouts.Margin>
              ) : null}
              <FormInput
                label={t(`${I18N_PATH}InstructionsForDriver`)}
                placeholder={t(`${I18N_PATH}AddSomeNotesForDriver`)}
                name="driverInstructions"
                value={values.driverInstructions}
                error={errors.driverInstructions}
                onChange={handleChange}
                disabled={isSubscriptionClosed}
                area
              />

              <OrderTimePicker disabled={isSubscriptionClosed} />
              <Layouts.Flex>
                <Layouts.Column>
                  {businessLineType !== BusinessLineType.residentialWaste ? (
                    <Checkbox
                      name="someoneOnSite"
                      onChange={handleChange}
                      value={values.someoneOnSite ?? undefined}
                      error={errors.someoneOnSite}
                      disabled={isSubscriptionClosed}
                    >
                      {t(`${I18N_PATH}SomeoneOnSite`)}
                    </Checkbox>
                  ) : null}
                  <Layouts.Margin top="1" bottom="1">
                    <Checkbox
                      name="alleyPlacement"
                      value={values.alleyPlacement}
                      error={errors.alleyPlacement}
                      onChange={handleChange}
                      disabled={!!values.customerJobSiteId || isSubscriptionEdit}
                    >
                      {t(`${I18N_PATH}AlleyPlacement`)}
                    </Checkbox>
                  </Layouts.Margin>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Margin bottom="1">
                    <Checkbox
                      name="highPriority"
                      value={values.highPriority}
                      error={errors.highPriority}
                      onChange={handleChange}
                      disabled={isSubscriptionClosed}
                    >
                      {t(`${I18N_PATH}HighPriority`)}
                    </Checkbox>
                  </Layouts.Margin>
                </Layouts.Column>
              </Layouts.Flex>
            </Layouts.Column>
          </Layouts.Flex>
          <DailyRoutesNotification />
          <WOChangedNotification />
        </Subsection>
      </Section>
      <ServiceItems
        isSubscriptionDraftEdit={isSubscriptionDraftEdit}
        isSubscriptionEdit={isSubscriptionEdit}
        isSubscriptionClosed={isSubscriptionClosed}
        isClone={isClone}
      />
    </>
  );
};

export default observer(OrderSection);
