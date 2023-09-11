import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import {
  Autocomplete,
  Calendar,
  Checkbox,
  IAutocompleteConfig,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { startOfToday } from 'date-fns';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { GlobalService, JobSiteService } from '@root/api';
import { AutocompleteTemplates, FormInput, Section, Subsection, Typography } from '@root/common';
import ContactSelect from '@root/components/ContactSelect/ContactSelect';
import { IJobSiteData } from '@root/components/forms/JobSite/types';
import { IContactFormData } from '@root/components/forms/NewContact/types';
import JobSiteModal from '@root/components/modals/JobSite/JobSite';
import NewContactModal from '@root/components/modals/NewContact/NewContact';
import OrderTimePicker from '@root/components/OrderTimePicker/OrderTimePicker';
import PermitSelect from '@root/components/PermitSelect/PermitSelect';
import PriceGroupSelect from '@root/components/PriceGroupSelect/PriceGroupSelect';
import PurchaseOrderSection from '@root/components/PurchaseOrderSection/PurchaseOrderSection';
import ThirdPartyHaulerSelect from '@root/components/ThirdPartyHaulerSelect/ThirdPartyHaulerSelect';
import { BillableItemActionEnum, BusinessLineType } from '@root/consts';
import { addressFormat, isPastDate, NotificationHelper } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useBusinessContext, useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import RouteSelect from '@root/quickViews/components/RouteSelect/RouteSelect';
import { sanitizeJobSite } from '@root/stores/jobSite/sanitize';
import { IConfigurableSubscriptionOrder, SubscriptionOrderStatusEnum } from '@root/types';
import { AddressSuggestion } from '@root/types/responseEntities';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { useIsScheduledOrInProgress } from '../../hooks';

import ContactFieldFooter from './components/ContactFieldFooter/ContactFieldFooter';

const today = startOfToday();

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.OrderDetails.';
const jobSiteService = new JobSiteService();

const OrderSection: React.FC = () => {
  const { values, errors, handleChange, setFieldValue } =
    useFormikContext<IConfigurableSubscriptionOrder>();
  const intl = useIntl();
  const { t } = useTranslation();
  const { formatPhoneNumber, firstDayOfWeek } = intl;
  const { businessUnitId } = useBusinessContext();
  const { dateFormat, formatDate } = useDateIntl();
  const [isJobSiteModalOpen, toggleJobSiteModalOpen] = useToggle();

  const { subscriptionStore, subscriptionOrderStore, contactStore, customerStore, i18nStore } =
    useStores();
  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const customerId = subscription?.customer?.originalId;
  const [isNewContactModalOpen, toggleIsNewContactModalOpen] = useToggle();

  const selectedCustomer = customerStore.selectedEntity;
  const businessLineType = subscription?.businessLine.type;

  const hasPermits = useMemo(
    () =>
      businessLineType &&
      [BusinessLineType.rollOff, BusinessLineType.portableToilets].includes(businessLineType),
    [businessLineType],
  );
  const oneTime = subscriptionOrder?.oneTime;
  const billableService = subscriptionOrder?.billableService;
  const isNonServiceOrder = billableService?.action === BillableItemActionEnum.nonService;
  const isScheduledOrInProgress = useIsScheduledOrInProgress();

  const handleNewContactFormSubmit = useCallback(
    (data: IContactFormData) => {
      data.phoneNumbers?.forEach(phoneNumber => {
        if (phoneNumber.id === 0) {
          delete phoneNumber.id;
        }
      });

      if (selectedCustomer?.id) {
        contactStore.create(
          {
            ...data,
            active: true,
            customerId: data.temporaryContact ? undefined : selectedCustomer?.id,
            main: false,
          },
          businessUnitId,
        );
      }
      toggleIsNewContactModalOpen();
    },
    [contactStore, toggleIsNewContactModalOpen, selectedCustomer?.id, businessUnitId],
  );

  const phoneNumbers = useMemo(
    () => [
      {
        options: contactStore.values.flatMap(
          contact =>
            contact.phoneNumbers?.map(phoneNumber => ({
              label: formatPhoneNumber(phoneNumber.number) ?? phoneNumber.number,
              value: formatPhoneNumber(phoneNumber.number) ?? phoneNumber.number,
              hint: contact.name,
            })) ?? [],
        ),
        footer: <ContactFieldFooter />,
        onFooterClick: toggleIsNewContactModalOpen,
      },
    ],
    [contactStore.values, toggleIsNewContactModalOpen, formatPhoneNumber],
  );

  const handleDestinationJobSiteClear = useCallback(() => {
    setFieldValue('searchString', '');
    setFieldValue('destinationJobSiteLabel', undefined);
    setFieldValue('destinationJobSiteId', undefined);
  }, [setFieldValue]);

  const handleJobSite2FormSubmit = useCallback(
    async (newJobSite: IJobSiteData) => {
      try {
        sanitizeJobSite(newJobSite);
        const jobSite = await jobSiteService.create(newJobSite);

        if (jobSite) {
          setFieldValue('jobSite2Label', addressFormat(jobSite.address));
          setFieldValue('searchString', '');
          setFieldValue('jobSite2Id', jobSite.id);
        }

        NotificationHelper.success('create', 'Job Site');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Job Site');
        Sentry.addBreadcrumb({
          category: 'Component',
          message: JSON.stringify(typedError?.message),
          level: 'warning',
        });
        Sentry.captureException(typedError);
      } finally {
        toggleJobSiteModalOpen();
      }
    },
    [setFieldValue, toggleJobSiteModalOpen],
  );

  const handleDestinationAutocompleteSelect = useCallback(
    (item: AddressSuggestion) => {
      setFieldValue('searchString', '');
      setFieldValue(
        'destinationJobSiteLabel',
        addressFormat({
          ...item,
          addressLine1: item.address,
          addressLine2: '',
          region: i18nStore.region,
        }),
      );
      setFieldValue('destinationJobSiteId', item.id);
    },
    [i18nStore.region, setFieldValue],
  );

  const destinationJobSiteSection = useMemo(() => {
    const billableServiceAction = billableService?.action;

    if (
      billableServiceAction === 'relocate' &&
      values.status === SubscriptionOrderStatusEnum.inProgress
    ) {
      const jobSiteAutocompleteConfigs: IAutocompleteConfig[] = [
        {
          name: 'jobSites',
          showFooterIfNoOption: true,
          onSelect: handleDestinationAutocompleteSelect,
          onFooterClick: toggleJobSiteModalOpen,
          template: <AutocompleteTemplates.JobSite />,
          footer: <AutocompleteTemplates.Footer text="Create new job site" />,
        },
      ];

      return (
        <Autocomplete
          name="searchString"
          label="Relocation Address"
          placeholder="Search job sites"
          search={values.searchString}
          onSearchChange={setFieldValue}
          onClear={handleDestinationJobSiteClear}
          selectedValue={values.destinationJobSiteLabel}
          onRequest={search => GlobalService.multiSearch(search, businessUnitId)}
          configs={jobSiteAutocompleteConfigs}
          error={errors.destinationJobSiteId}
        />
      );
    }

    return null;
  }, [
    billableService?.action,
    values.status,
    values.searchString,
    values.destinationJobSiteLabel,
    handleDestinationAutocompleteSelect,
    toggleJobSiteModalOpen,
    setFieldValue,
    handleDestinationJobSiteClear,
    errors.destinationJobSiteId,
    businessUnitId,
  ]);

  return (
    <>
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onFormSubmit={handleNewContactFormSubmit}
        onClose={toggleIsNewContactModalOpen}
        fullSize
      />
      <JobSiteModal
        isOpen={isJobSiteModalOpen}
        onFormSubmit={handleJobSite2FormSubmit}
        onClose={toggleJobSiteModalOpen}
        withMap={false}
      />
      <Section>
        <Subsection>
          <Layouts.Margin bottom="1">
            <Layouts.Flex justifyContent="space-between">
              <Typography variant="headerThree">{t(`${I18N_PATH}Header`)}</Typography>
            </Layouts.Flex>
          </Layouts.Margin>
          <Layouts.Flex justifyContent="space-between">
            <Layouts.Column>
              <ContactSelect
                label={t(`${I18N_PATH}ContactSelect`)}
                placeholder={t(`${I18N_PATH}ContactSelectPlaceholder`)}
                name="subscriptionContactId"
                customerId={customerId}
                value={values.subscriptionContactId}
                error={errors.subscriptionContactId}
                onSelectChange={setFieldValue}
                disabled
              />
              <PurchaseOrderSection
                fullSizeModal
                customerId={customerId}
                purchaseOrderId={subscriptionOrder?.purchaseOrderId}
              />
              {hasPermits ? (
                <PermitSelect
                  placeholder={t(`${I18N_PATH}PermitSelectPlaceholder`)}
                  label={t(`${I18N_PATH}PermitSelect`)}
                  name="permitId"
                  businessLineId={subscription?.businessLine.id}
                  businessUnitId={subscription?.businessUnit.id}
                  value={values.permitId ?? undefined}
                  error={errors.permitId}
                  onSelectChange={setFieldValue}
                  disabled={!oneTime}
                />
              ) : null}
              {values.thirdPartyHaulerId ? (
                <ThirdPartyHaulerSelect
                  label={t(`${I18N_PATH}ThirdPartyHaulerSelect`)}
                  placeholder={t(`${I18N_PATH}ThirdPartyHaulerSelectPlaceholder`)}
                  name="thirdPartyHaulerId"
                  value={values.thirdPartyHaulerId}
                  error={errors.thirdPartyHaulerId}
                  onSelectChange={setFieldValue}
                  disabled
                  nonClearable
                />
              ) : null}
              <Calendar
                label={t(`${I18N_PATH}ServiceDate`)}
                name="serviceDate"
                withInput
                value={values.serviceDate}
                error={errors.serviceDate}
                minDate={today}
                onDateChange={setFieldValue}
                readOnly={!isScheduledOrInProgress || isPastDate(values.serviceDate)}
                firstDayOfWeek={firstDayOfWeek}
                dateFormat={dateFormat}
                formatDate={formatDate}
              />
              <PriceGroupSelect
                label={t(`${I18N_PATH}PriceGroupSelect`)}
                placeholder={t(`${I18N_PATH}PriceGroupSelectPlaceholder`)}
                name="customRatesGroupId"
                value={values.customRatesGroupId}
                error={errors.customRatesGroupId}
                onSelectChange={setFieldValue}
                disabled
              />
              {subscription?.serviceArea ? (
                <RouteSelect
                  label={t(`${I18N_PATH}PreferredRoute`)}
                  placeholder={t(`${I18N_PATH}PreferredRoutePlaceholder`)}
                  name="assignedRoute"
                  onSelectChange={setFieldValue}
                  value={values.assignedRoute ?? undefined}
                  error={errors.assignedRoute}
                  disabled={!isScheduledOrInProgress || isPastDate(values.serviceDate)}
                  serviceDate={values.serviceDate}
                  serviceAreaId={
                    subscription?.serviceArea?.originalId ?? subscription?.serviceArea?.id
                  }
                  businessLineType={businessLineType}
                />
              ) : null}
            </Layouts.Column>
            <Layouts.Column>
              {oneTime && !isNonServiceOrder ? (
                <>
                  <Select
                    label={t(`${I18N_PATH}CallOnWay`)}
                    placeholder={t(`${I18N_PATH}SelectPhoneNumber`)}
                    name="callOnWayPhoneNumber"
                    options={phoneNumbers}
                    value={values.callOnWayPhoneNumber ?? ''}
                    error={errors.callOnWayPhoneNumber}
                    onSelectChange={setFieldValue}
                  />
                  <Select
                    label={t(`${I18N_PATH}TextOnWay`)}
                    placeholder={t(`${I18N_PATH}SelectPhoneForText`)}
                    name="textOnWayPhoneNumber"
                    options={phoneNumbers}
                    value={values.textOnWayPhoneNumber ?? ''}
                    error={errors.textOnWayPhoneNumber}
                    onSelectChange={setFieldValue}
                  />
                </>
              ) : null}
              {destinationJobSiteSection}
              <FormInput
                label={t(`${I18N_PATH}InstructionsForDriver`)}
                placeholder={t(`${I18N_PATH}InstructionsForDriverPlaceholder`)}
                name="instructionsForDriver"
                value={values.instructionsForDriver}
                error={errors.instructionsForDriver}
                onChange={handleChange}
                disabled={!isScheduledOrInProgress}
                area
              />
              <OrderTimePicker disabled={!isScheduledOrInProgress} />
              <Layouts.Flex>
                <Layouts.Column>
                  {businessLineType !== BusinessLineType.residentialWaste ? (
                    <Checkbox
                      name="someoneOnSite"
                      onChange={handleChange}
                      value={values.someoneOnSite ?? undefined}
                      error={errors.someoneOnSite}
                      disabled={!oneTime || !isScheduledOrInProgress}
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
                      disabled={!oneTime || !isScheduledOrInProgress}
                    >
                      {t(`${I18N_PATH}AlleyPlacement`)}
                    </Checkbox>
                  </Layouts.Margin>
                </Layouts.Column>
                <Layouts.Column>
                  {businessLineType === BusinessLineType.portableToilets && oneTime ? (
                    <Layouts.Margin bottom="1">
                      <Checkbox
                        name="toRoll"
                        value={values.toRoll}
                        error={errors.toRoll}
                        onChange={handleChange}
                        disabled={!isScheduledOrInProgress}
                      >
                        {t(`${I18N_PATH}OkToRoll`)}
                      </Checkbox>
                    </Layouts.Margin>
                  ) : null}
                  <Layouts.Margin bottom="1">
                    <Checkbox
                      name="highPriority"
                      value={values.highPriority}
                      error={errors.highPriority}
                      onChange={handleChange}
                      disabled={!oneTime || !isScheduledOrInProgress}
                    >
                      {t(`${I18N_PATH}HighPriority`)}
                    </Checkbox>
                  </Layouts.Margin>
                </Layouts.Column>
              </Layouts.Flex>
              <Layouts.Margin top="1">
                <FormInput
                  placeholder={t('Text.DroppedEquipment')}
                  label={`${t('Text.DroppedEquipment')} #`}
                  name="droppedEquipmentItem"
                  value={values.droppedEquipmentItem}
                  error={errors.droppedEquipmentItem}
                  onChange={handleChange}
                  disabled={!subscriptionOrder?.isEquipmentEditable}
                />
                <FormInput
                  placeholder={t('Text.PickedUpEquipment')}
                  label={`${t('Text.PickedUpEquipment')} #`}
                  name="pickedUpEquipmentItem"
                  value={values.pickedUpEquipmentItem}
                  error={errors.pickedUpEquipmentItem}
                  onChange={handleChange}
                  disabled={!subscriptionOrder?.isEquipmentEditable}
                />
              </Layouts.Margin>
            </Layouts.Column>
          </Layouts.Flex>
        </Subsection>
      </Section>
    </>
  );
};

export default observer(OrderSection);
