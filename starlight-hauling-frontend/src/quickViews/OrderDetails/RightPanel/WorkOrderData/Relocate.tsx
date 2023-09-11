import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Calendar,
  IAutocompleteConfig,
  ISelectOption,
  Layouts,
  Select,
  TimePicker,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { sortBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService, JobSiteService } from '@root/api';
import { AutocompleteTemplates, Banner, FormInput } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { type IJobSiteData } from '@root/components/forms/JobSite/types';
import { JobSiteModal } from '@root/components/modals';
import { addressFormat, NotificationHelper } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCrudPermissions, useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { sanitizeJobSite } from '@root/stores/jobSite/sanitize';
import { IConfigurableOrder, IEditableWorkOrder } from '@root/types';
import { type AddressSuggestion } from '@root/types/responseEntities';

import { ApiError } from '@root/api/base/ApiError';
import { getDemurrageError, getOverusedError } from '../../../helpers/orderItemsData';

import styles from '../css/styles.scss';
import MediaFilesSection from './MediaFilesSection';
import { type IWorkOrderDataProps } from './types';

const jobSiteService = new JobSiteService();

const RelocateWorkOrderData: React.FC<IWorkOrderDataProps> = ({ onChangeStartService }) => {
  const { values, errors, handleChange, setFieldValue } = useFormikContext<IConfigurableOrder>();
  const [isJobSiteModalOpen, toggleJobSiteModalOpen] = useToggle();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();
  const { i18nStore, driverStore } = useStores();

  const overusedErrorMessage = getOverusedError(values);
  const demurrageErrorMessage = getDemurrageError(values);
  const [canViewDrivers] = useCrudPermissions('configuration', 'drivers-trucks');

  useEffect(() => {
    if (!canViewDrivers) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }
    driverStore.requestAll({ activeOnly: true, filterByBusinessUnit: businessUnitId });
  }, [businessUnitId, canViewDrivers, driverStore]);

  const handleDriverChange = useCallback(
    (name: string, value: number) => {
      setFieldValue(name, value);
      const truckId = driverStore.values.find(driver => driver.id === value)?.truckId;

      setFieldValue('workOrder.truckId', truckId);
    },
    [driverStore.values, setFieldValue],
  );

  const handleJobSite2AutocompleteSelect = useCallback(
    (item: AddressSuggestion) => {
      setFieldValue(
        'jobSite2Label',
        addressFormat({
          ...item,
          addressLine1: item.address,
          addressLine2: '',
          region: i18nStore.region,
        }),
      );
      setFieldValue('jobSite2Id', item.id);
      setFieldValue('searchString', '');
    },
    [i18nStore.region, setFieldValue],
  );

  const handleJobSite2Clear = useCallback(() => {
    setFieldValue('searchString', '');
    setFieldValue('jobSite2Label', undefined);
    setFieldValue('jobSite2Id', undefined);
  }, [setFieldValue]);

  const handleJobSite2FormSubmit = useCallback(
    async (newJobSite: IJobSiteData) => {
      try {
        sanitizeJobSite(newJobSite);
        const jobSite = await jobSiteService.create(newJobSite);

        if (jobSite) {
          setFieldValue('searchString', addressFormat(jobSite.address));
          setFieldValue('jobSite2Id', jobSite.id);
        }

        NotificationHelper.success('create', 'Job Site');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('create', typedError.response.code as ActionCode, 'Job Site');
      } finally {
        toggleJobSiteModalOpen();
      }
    },
    [setFieldValue, toggleJobSiteModalOpen],
  );

  const jobSite2AutocompleteConfig: IAutocompleteConfig[] = useMemo(() => {
    return [
      {
        name: 'jobSites',
        onSelect: handleJobSite2AutocompleteSelect,
        template: <AutocompleteTemplates.JobSite />,
        footer: <AutocompleteTemplates.Footer text="Create new job site" />,
        onFooterClick: toggleJobSiteModalOpen,
        showFooterIfNoOption: true,
      },
    ];
  }, [handleJobSite2AutocompleteSelect, toggleJobSiteModalOpen]);

  const handleChangePickedUpEquipmentItem = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, name } = e.target;

      setFieldValue(name, value);
      setFieldValue('workOrder.droppedEquipmentItem', value);
    },
    [setFieldValue],
  );

  const driversOptions: ISelectOption[] = sortBy(driverStore.values, ['description']).map(
    driver => ({
      label: driver.description,
      value: driver.id,
    }),
  );

  const { dateFormat } = useDateIntl();
  const workOrdersError = errors.workOrder as IEditableWorkOrder | undefined;

  return (
    <>
      <JobSiteModal
        isOpen={isJobSiteModalOpen}
        onFormSubmit={handleJobSite2FormSubmit}
        onClose={toggleJobSiteModalOpen}
        overlayClassName={styles.modalOverlay}
        withMap={false}
      />
      {values.status === 'inProgress' ? (
        <Layouts.Cell width={4}>
          <Autocomplete
            name="searchString"
            label="Relocation Address"
            placeholder="Search job sites"
            search={values.searchString ?? ''}
            onSearchChange={setFieldValue}
            onClear={handleJobSite2Clear}
            onRequest={search => GlobalService.multiSearch(search, businessUnitId)}
            configs={jobSite2AutocompleteConfig}
            error={errors.jobSite2Id}
            selectedValue={values.jobSite2Label}
          />

          <Divider bottom />
        </Layouts.Cell>
      ) : null}
      <Calendar
        label="Completion Date"
        name="workOrder.completionDate"
        onDateChange={setFieldValue}
        placeholder={t('Text.SetDate')}
        firstDayOfWeek={firstDayOfWeek}
        dateFormat={dateFormat}
        value={values.workOrder?.completionDate}
        error={workOrdersError?.completionDate}
        withInput
      />
      <Select
        label="Driver*"
        name="workOrder.driverId"
        value={values.workOrder?.driverId}
        options={driversOptions}
        onSelectChange={handleDriverChange}
        error={workOrdersError?.driverId as string}
      />
      <FormInput
        label="Picked Up Equipment #"
        name="workOrder.pickedUpEquipmentItem"
        value={values.workOrder?.pickedUpEquipmentItem}
        onChange={handleChangePickedUpEquipmentItem}
        error={workOrdersError?.pickedUpEquipmentItem}
        borderError={!!overusedErrorMessage}
      />
      <FormInput
        label="Route #"
        name="workOrder.route"
        value={values.workOrder?.route}
        onChange={handleChange}
        error={workOrdersError?.route}
      />
      {overusedErrorMessage ? (
        <Layouts.Cell width={4}>
          <Banner className={styles.errorBanner} showIcon={false} color="alert">
            {overusedErrorMessage}
          </Banner>
        </Layouts.Cell>
      ) : null}
      <Layouts.Cell width={4}>
        <Divider bottom top={!!overusedErrorMessage} />
      </Layouts.Cell>
      <TimePicker
        label="Start Work Order"
        name="workOrder.startWorkOrderDate"
        value={values.workOrder?.startWorkOrderDate}
        onChange={setFieldValue}
        disabled={!values.unlockOverrides}
        error={workOrdersError?.startWorkOrderDate}
        minuteIncrement={1}
      />
      <TimePicker
        label="Arrive On Site"
        name="workOrder.arriveOnSiteDate"
        borderError={!!demurrageErrorMessage}
        value={values.workOrder?.arriveOnSiteDate}
        onChange={setFieldValue}
        disabled={!values.unlockOverrides}
        error={workOrdersError?.arriveOnSiteDate}
        minuteIncrement={1}
      />

      <TimePicker
        label="Start Service Time"
        name="workOrder.startServiceDate"
        borderError={!!demurrageErrorMessage}
        value={values.workOrder?.startServiceDate}
        onChange={onChangeStartService}
        disabled={!values.unlockOverrides}
        error={workOrdersError?.startServiceDate}
        minuteIncrement={1}
      />
      <TimePicker
        label="Finish Work Order"
        name="workOrder.finishServiceDate"
        value={values.workOrder?.finishServiceDate}
        onChange={setFieldValue}
        disabled={!values.unlockOverrides}
        error={workOrdersError?.finishServiceDate}
        minuteIncrement={1}
      />
      {demurrageErrorMessage ? (
        <Layouts.Cell width={4}>
          <Banner className={styles.errorBanner} showIcon={false} color="alert">
            {demurrageErrorMessage}
          </Banner>
        </Layouts.Cell>
      ) : null}
      {values.workOrder?.mediaFiles.length ? (
        <>
          <Layouts.Cell width={4}>
            <Divider both />
          </Layouts.Cell>

          <Layouts.Cell left={3} width={2}>
            <MediaFilesSection />
          </Layouts.Cell>
        </>
      ) : null}

      <Layouts.Cell width={4}>
        <Divider
          both={!values.workOrder?.mediaFiles.length}
          bottom={!!values.workOrder?.mediaFiles.length}
        />
      </Layouts.Cell>
    </>
  );
};

export default observer(RelocateWorkOrderData);
