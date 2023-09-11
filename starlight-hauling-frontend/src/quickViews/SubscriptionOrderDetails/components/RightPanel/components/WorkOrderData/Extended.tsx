import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import {
  Autocomplete,
  Calendar,
  IAutocompleteConfig,
  Layouts,
  Select,
  TimePicker,
  useToggle,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { GlobalService, JobSiteService } from '@root/api';
import { AutocompleteTemplates, FormInput, ValidationMessageBlock } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { IJobSiteData } from '@root/components/forms/JobSite/types';
import JobSiteModal from '@root/components/modals/JobSite/JobSite';
import { BillableItemActionEnum, BusinessLineType } from '@root/consts';
import { addressFormat, normalizeOptions, NotificationHelper } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { sanitizeJobSite } from '@root/stores/jobSite/sanitize';
import { IConfigurableSubscriptionOrder, SubscriptionOrderStatusEnum } from '@root/types';
import { AddressSuggestion } from '@root/types/responseEntities';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import MediaFilesSection from './MediaFilesSection';
import { type IWorkOrderDataProps } from './types';

const weightUnitsOptions = normalizeOptions(['none', 'yards', 'tons']);
const I18N_PATH = 'Form.WorkOrderData.Text.';
const jobSiteService = new JobSiteService();

const ExtendedWorkOrderData: React.FC<IWorkOrderDataProps> = ({
  oneTime,
  action,
  businessLineType,
}) => {
  const { t } = useTranslation();
  const { dateFormat, formatDate } = useDateIntl();
  const { firstDayOfWeek } = useIntl();
  const [isJobSiteModalOpen, toggleJobSiteModalOpen] = useToggle();
  const { businessUnitId } = useBusinessContext();
  const { i18nStore } = useStores();

  const { values, handleChange, errors, setFieldValue } =
    useFormikContext<IConfigurableSubscriptionOrder>();

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
    if (action === 'relocate' && values.status === SubscriptionOrderStatusEnum.inProgress) {
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
    action,
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
      <JobSiteModal
        isOpen={isJobSiteModalOpen}
        onFormSubmit={handleJobSite2FormSubmit}
        onClose={toggleJobSiteModalOpen}
        withMap={false}
      />
      {destinationJobSiteSection}
      <Calendar
        label={t(`${I18N_PATH}CompletionDate`)}
        name="completionDate"
        onDateChange={setFieldValue}
        value={values.completionDate}
        error={errors.completionDate}
        withInput
        firstDayOfWeek={firstDayOfWeek}
        dateFormat={dateFormat}
        formatDate={formatDate}
        readOnly
      />
      <FormInput
        label={`${t(`${I18N_PATH}Truck`)} #`}
        name="truck"
        value={values.truck}
        onChange={handleChange}
        error={errors.truck}
        disabled
      />
      <FormInput
        label={`${t(`${I18N_PATH}DroppedEquipment`)} #`}
        name="droppedEquipmentItem"
        value={values.droppedEquipmentItem}
        onChange={handleChange}
        error={errors.droppedEquipmentItem}
      />
      <FormInput
        label={`${t(`${I18N_PATH}Route`)} #`}
        name="assignedRoute"
        value={values.assignedRoute}
        onChange={handleChange}
        error={errors.assignedRoute}
        disabled
      />
      {action !== BillableItemActionEnum.final ? (
        <FormInput
          label={`${t(`${I18N_PATH}PickedUpEquipment`)} #`}
          name="pickedUpEquipmentItem"
          value={values.pickedUpEquipmentItem}
          onChange={handleChange}
          error={errors.pickedUpEquipmentItem}
        />
      ) : null}
      {businessLineType === BusinessLineType.commercialWaste &&
      action !== BillableItemActionEnum.reposition &&
      action !== BillableItemActionEnum.relocate ? (
        <>
          <FormInput
            label={t(`${I18N_PATH}Weight`)}
            name="weight"
            value={values.weight}
            onChange={handleChange}
            error={errors.weight}
            type="number"
            disabled
          />
          <Layouts.Margin top="3.5">
            <Select
              options={weightUnitsOptions}
              onSelectChange={setFieldValue}
              value={values.weightUnit ?? undefined}
              name="weightUnit"
              ariaLabel="Weight unit value"
              error={errors.weightUnit}
              nonClearable
              disabled
            />
          </Layouts.Margin>
        </>
      ) : null}

      <Layouts.Cell left="1" width={4}>
        <Divider bottom />
      </Layouts.Cell>
      {oneTime ? (
        <>
          <TimePicker
            label={t(`${I18N_PATH}StartWorkOrderTime`)}
            name="startedAt"
            value={values.startedAt}
            onChange={setFieldValue}
            error={errors.startedAt}
            disabled
          />
          <TimePicker
            label={t(`${I18N_PATH}ArriveOnSite`)}
            name="arrivedAt"
            value={values.arrivedAt}
            onChange={setFieldValue}
            error={errors.arrivedAt}
            disabled
          />
          <TimePicker
            label={t(`${I18N_PATH}StartServiceTime`)}
            name="startServiceDate"
            value={values.startServiceDate}
            onChange={setFieldValue}
            error={errors.startServiceDate}
            disabled
          />
          <TimePicker
            label={t(`${I18N_PATH}FinisWorkOrder`)}
            name="finishWorkOrderDate"
            value={values.finishWorkOrderDate}
            onChange={setFieldValue}
            error={errors.finishWorkOrderDate}
            disabled
          />
        </>
      ) : (
        <TimePicker
          label={t(`${I18N_PATH}CompletionTime`)}
          name="completionTime"
          value={values.completionTime}
          onChange={setFieldValue}
          error={errors.completionTime}
          disabled
        />
      )}
      <Layouts.Cell left="1" width={4}>
        <ValidationMessageBlock color="primary" shade="desaturated" textColor="secondary">
          {t(`${I18N_PATH}DetailedInformationCompletionTime`)}
        </ValidationMessageBlock>
      </Layouts.Cell>
      <Layouts.Cell left="1" width={4}>
        <Divider both />
      </Layouts.Cell>
      <Layouts.Cell left="3" width={2}>
        <MediaFilesSection />
      </Layouts.Cell>
      <Layouts.Cell left="1" width={4}>
        <Divider both={!values.mediaFiles?.length} bottom={!!values.mediaFiles?.length} />
      </Layouts.Cell>
    </>
  );
};

export default observer(ExtendedWorkOrderData);
