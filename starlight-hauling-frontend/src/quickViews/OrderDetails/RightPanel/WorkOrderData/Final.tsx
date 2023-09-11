import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  ISelectOption,
  Layouts,
  Select,
  TimePicker,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { useFormikContext } from 'formik';
import { sortBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Banner, FormInput } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { normalizeOptions, NotificationHelper } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCrudPermissions, useStores, useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableOrder, IEditableWorkOrder } from '@root/types';

import {
  getDemurrageError,
  getOverusedError,
  getOverweightError,
} from '../../../helpers/orderItemsData';

import styles from '../css/styles.scss';
import MediaFilesSection from './MediaFilesSection';
import TicketPreview from './TicketPreview';
import { IWorkOrderDataProps } from './types';

const FinalWorkOrderData: React.FC<IWorkOrderDataProps> = ({
  onChangeStartService,
  onChangeWeight,
}) => {
  const { disposalSiteStore, driverStore } = useStores();
  const { values, errors, handleChange, setFieldValue } = useFormikContext<IConfigurableOrder>();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();

  const { currentUser } = useUserContext();
  const { firstDayOfWeek } = useIntl();

  const weightUnitsOptions = normalizeOptions(
    currentUser?.company?.unit === Units.metric
      ? [
          { value: 'tons', label: 'Tonne' },
          { value: 'yards', label: 'Meter' },
        ]
      : ['tons', 'yards'],
  );

  const [canViewDisposalSites] = useCrudPermissions('configuration', 'disposal-sites');
  const [canViewDrivers] = useCrudPermissions('configuration', 'drivers-trucks');

  const handleDriverChange = useCallback(
    (name: string, value: number) => {
      setFieldValue(name, value);
      const truckId = driverStore.values.find(driver => driver.id === value)?.truckId;

      setFieldValue('workOrder.truckId', truckId);
    },
    [driverStore.values, setFieldValue],
  );

  useEffect(() => {
    if (!canViewDisposalSites || !canViewDrivers) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    driverStore.requestAll({ activeOnly: true, filterByBusinessUnit: businessUnitId });
    disposalSiteStore.request({ activeOnly: true });
  }, [businessUnitId, canViewDisposalSites, canViewDrivers, disposalSiteStore, driverStore]);

  const driversOptions: ISelectOption[] = sortBy(driverStore.values, ['description']).map(
    driver => ({
      label: driver.description,
      value: driver.id,
    }),
  );

  const disposalOptions: ISelectOption[] = disposalSiteStore.values.map(driver => ({
    label: driver.description,
    value: driver.id,
  }));

  const overusedErrorMessage = getOverusedError(values);
  const overweightErrorMessage = getOverweightError(values);
  const demurrageErrorMessage = getDemurrageError(values);
  const { dateFormat } = useDateIntl();
  const workOrdersError = errors.workOrder as IEditableWorkOrder | undefined;

  return (
    <>
      <Layouts.Cell width={3}>
        <Select
          label="Disposal Site*"
          options={disposalOptions}
          onSelectChange={setFieldValue}
          value={values.disposalSiteId ?? undefined}
          name="disposalSiteId"
          error={errors.disposalSiteId}
        />
      </Layouts.Cell>
      <FormInput
        label="Route #"
        name="workOrder.route"
        value={values.workOrder?.route}
        onChange={handleChange}
        error={workOrdersError?.route}
      />
      <Layouts.Cell width={4}>
        <Divider bottom />
      </Layouts.Cell>
      <Calendar
        label="Completion Date*"
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
      <div />
      <FormInput
        label="Picked Up Equipment #*"
        name="workOrder.pickedUpEquipmentItem"
        value={values.workOrder?.pickedUpEquipmentItem}
        onChange={handleChange}
        error={workOrdersError?.pickedUpEquipmentItem}
        borderError={!!overusedErrorMessage}
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
      <FormInput
        label="Weight*"
        name="workOrder.weight"
        value={values.workOrder?.weight}
        onChange={onChangeWeight}
        error={workOrdersError?.weight}
        borderError={!!overweightErrorMessage}
        type="number"
        disabled={!values.unlockOverrides}
      />

      <Select
        options={weightUnitsOptions}
        onSelectChange={setFieldValue}
        value={values.workOrder?.weightUnit}
        name="workOrder.weightUnit"
        ariaLabel="Weight unit value"
        className={styles.spaceTop}
        error={workOrdersError?.weightUnit}
        nonClearable
      />

      {overweightErrorMessage ? (
        <Layouts.Cell width={2}>
          <Banner
            className={cx(styles.overweightErrorBanner, styles.errorBanner)}
            color="alert"
            showIcon={false}
          >
            {overweightErrorMessage}
          </Banner>
        </Layouts.Cell>
      ) : null}
      <Layouts.Cell width={4}>
        <Divider bottom />
      </Layouts.Cell>
      <TimePicker
        label="Start Work Order*"
        name="workOrder.startWorkOrderDate"
        value={values.workOrder?.startWorkOrderDate}
        onChange={setFieldValue}
        disabled={!values.unlockOverrides}
        error={workOrdersError?.startWorkOrderDate}
        minuteIncrement={1}
      />
      <TimePicker
        label="Arrive On Site*"
        name="workOrder.arriveOnSiteDate"
        borderError={!!demurrageErrorMessage}
        value={values.workOrder?.arriveOnSiteDate}
        onChange={setFieldValue}
        disabled={!values.unlockOverrides}
        error={workOrdersError?.arriveOnSiteDate}
        minuteIncrement={1}
      />

      <TimePicker
        label="Start Service Time*"
        name="workOrder.startServiceDate"
        borderError={!!demurrageErrorMessage}
        value={values.workOrder?.startServiceDate}
        onChange={onChangeStartService}
        disabled={!values.unlockOverrides}
        error={workOrdersError?.startServiceDate}
        minuteIncrement={1}
      />
      <TimePicker
        label="Finish Work Order*"
        name="workOrder.finishServiceDate"
        disabled={!values.unlockOverrides}
        value={values.workOrder?.finishServiceDate}
        onChange={setFieldValue}
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
      <Layouts.Cell width={4}>
        <Divider both />
      </Layouts.Cell>
      <FormInput
        label="Ticket #*"
        name="workOrder.ticket"
        value={values.workOrder?.ticket ?? ''}
        onChange={handleChange}
        error={workOrdersError?.ticket as string}
      />
      <Layouts.Cell width={1}>
        <TicketPreview />
      </Layouts.Cell>
      <Layouts.Cell width={2}>
        <MediaFilesSection />
      </Layouts.Cell>
      <Layouts.Cell width={4}>
        <Divider bottom />
      </Layouts.Cell>
    </>
  );
};

export default observer(FinalWorkOrderData);
