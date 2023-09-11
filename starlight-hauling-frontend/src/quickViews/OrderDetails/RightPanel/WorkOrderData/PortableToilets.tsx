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

import { Banner, FormInput } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { ChangePortableToiletPositionActions } from '@root/consts';
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

const I18N_PATH = 'Form.WorkOrderData.Text.';

const PortableToiletsWorkOrderData: React.FC<IWorkOrderDataProps> = ({ onChangeStartService }) => {
  const { t } = useTranslation();
  const { dateFormat, formatDate } = useDateIntl();

  const { driverStore } = useStores();
  const { values, handleChange, errors, setFieldValue } = useFormikContext<IConfigurableOrder>();
  const { businessUnitId } = useBusinessContext();
  const { firstDayOfWeek } = useIntl();
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

  const overusedErrorMessage = getOverusedError(values);
  const demurrageErrorMessage = getDemurrageError(values);

  const isShowPickedUpEquipmentItem =
    values.billableService?.action &&
    ChangePortableToiletPositionActions.includes(values.billableService.action);
  const workOrdersError = errors.workOrder as IEditableWorkOrder | undefined;

  return (
    <>
      <Calendar
        label={`${t(`${I18N_PATH}CompletionDate`)}`}
        name="workOrder.completionDate"
        onDateChange={setFieldValue}
        value={values.workOrder?.completionDate}
        error={workOrdersError?.completionDate}
        withInput
        firstDayOfWeek={firstDayOfWeek}
        dateFormat={dateFormat}
        formatDate={formatDate}
      />
      <Select
        label={t(`${I18N_PATH}Driver`)}
        name="workOrder.driverId"
        value={values.workOrder?.driverId}
        options={driversOptions}
        onSelectChange={handleDriverChange}
        error={workOrdersError?.driverId as string}
        disabled
      />
      <FormInput
        label={`${t(`${I18N_PATH}DroppedEquipment`)} #`}
        name="workOrder.droppedEquipmentItem"
        value={values.workOrder?.droppedEquipmentItem}
        onChange={handleChange}
        error={workOrdersError?.droppedEquipmentItem}
        disabled
      />
      <FormInput
        label={`${t(`${I18N_PATH}Route`)} #`}
        name="workOrder.route"
        value={values.workOrder?.route}
        onChange={handleChange}
        error={workOrdersError?.route}
        disabled
      />
      {overusedErrorMessage && !isShowPickedUpEquipmentItem ? (
        <Layouts.Cell width={4}>
          <Banner className={styles.errorBanner} showIcon={false} color="alert">
            {overusedErrorMessage}
          </Banner>
        </Layouts.Cell>
      ) : null}

      {isShowPickedUpEquipmentItem ? (
        <>
          <Layouts.Cell width={4}>
            <Divider bottom />
          </Layouts.Cell>
          <FormInput
            label={`${t(`${I18N_PATH}PickedUpEquipment`)} #`}
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
        </>
      ) : null}

      <Layouts.Cell width={4}>
        <Divider bottom />
      </Layouts.Cell>
      <TimePicker
        label={t(`${I18N_PATH}StartWorkOrder`)}
        name="workOrder.startWorkOrderDate"
        value={values.workOrder?.startWorkOrderDate}
        onChange={setFieldValue}
        error={workOrdersError?.startWorkOrderDate}
        disabled
        minuteIncrement={1}
      />
      <TimePicker
        label={t(`${I18N_PATH}ArriveOnSite`)}
        name="workOrder.arriveOnSiteDate"
        borderError={!!demurrageErrorMessage}
        value={values.workOrder?.arriveOnSiteDate}
        onChange={setFieldValue}
        error={workOrdersError?.arriveOnSiteDate}
        disabled
        minuteIncrement={1}
      />

      <TimePicker
        label={t(`${I18N_PATH}StartServiceTime`)}
        name="workOrder.startServiceDate"
        borderError={!!demurrageErrorMessage}
        value={values.workOrder?.startServiceDate}
        onChange={onChangeStartService}
        error={workOrdersError?.startServiceDate}
        disabled
        minuteIncrement={1}
      />
      <TimePicker
        label={t(`${I18N_PATH}FinisWorkOrder`)}
        name="workOrder.finishServiceDate"
        value={values.workOrder?.finishServiceDate}
        onChange={setFieldValue}
        error={workOrdersError?.finishServiceDate}
        disabled
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
      <div />
      <div />
      <Layouts.Cell left={3} width={2}>
        <MediaFilesSection />
      </Layouts.Cell>

      <Layouts.Cell width={4}>
        <Divider
          both={!values.workOrder?.mediaFiles.length}
          bottom={!!values.workOrder?.mediaFiles.length}
        />
      </Layouts.Cell>
    </>
  );
};

export default PortableToiletsWorkOrderData;
