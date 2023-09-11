import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  ISelectOption,
  Layouts,
  Select,
  TimePicker,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { sortBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Banner, FormInput } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCrudPermissions, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableOrder, IEditableWorkOrder } from '@root/types';

import { getDemurrageError, getOverusedError } from '../../../helpers/orderItemsData';

import styles from '../css/styles.scss';
import MediaFilesSection from './MediaFilesSection';
import { type IWorkOrderDataProps } from './types';

const RepositionWorkOrderData: React.FC<IWorkOrderDataProps> = ({ onChangeStartService }) => {
  const { driverStore } = useStores();
  const { values, handleChange, errors, setFieldValue } = useFormikContext<IConfigurableOrder>();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const overusedErrorMessage = getOverusedError(values);
  const demurrageErrorMessage = getDemurrageError(values);
  const { dateFormat } = useDateIntl();
  const [canViewDrivers] = useCrudPermissions('configuration', 'drivers-trucks');

  useEffect(() => {
    if (!canViewDrivers) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }
    driverStore.requestAll({ activeOnly: true, filterByBusinessUnit: businessUnitId });
  }, [businessUnitId, canViewDrivers, driverStore]);

  const driversOptions: ISelectOption[] = sortBy(driverStore.values, ['description']).map(
    driver => ({
      label: driver.description,
      value: driver.id,
    }),
  );

  const handleDriverChange = useCallback(
    (name: string, value: number) => {
      setFieldValue(name, value);
      const truckId = driverStore.values.find(driver => driver.id === value)?.truckId;

      setFieldValue('workOrder.truckId', truckId);
    },
    [driverStore.values, setFieldValue],
  );

  const handleChangePickedUpEquipmentItem = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, name } = e.target;

      setFieldValue(name, value);
      setFieldValue('workOrder.droppedEquipmentItem', value);
    },
    [setFieldValue],
  );
  const workOrdersError = errors.workOrder as IEditableWorkOrder | undefined;
  return (
    <>
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
        label="Driver"
        name="workOrder.driverId"
        value={values.workOrder?.driverId}
        onSelectChange={handleDriverChange}
        options={driversOptions}
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
        error={workOrdersError?.startWorkOrderDate}
        disabled={!values.unlockOverrides}
        minuteIncrement={1}
      />
      <TimePicker
        label="Arrive On Site"
        name="workOrder.arriveOnSiteDate"
        borderError={!!demurrageErrorMessage}
        value={values.workOrder?.arriveOnSiteDate}
        onChange={setFieldValue}
        error={workOrdersError?.arriveOnSiteDate}
        disabled={!values.unlockOverrides}
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
        error={workOrdersError?.finishServiceDate}
        disabled={!values.unlockOverrides}
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

export default observer(RepositionWorkOrderData);
