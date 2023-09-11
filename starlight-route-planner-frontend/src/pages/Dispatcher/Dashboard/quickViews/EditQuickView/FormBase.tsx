import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormInput,
  Layouts,
  ReminderIcon,
  Select,
  TextInputElement,
  TimePicker,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { floor, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { StatusesSelect, WarningPreview } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { BusinessLineTypeSymbol, DailyRouteStatus } from '@root/consts';
import {
  isDailyRouteDriverNonUnique,
  isDailyRouteTruckNonUnique,
  isRouteDriverInactive,
  isRouteTruckInactive,
} from '@root/helpers';
import { useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IDashboardDailyRoute } from '@root/types';

import { FormDataType } from './formikData';
import { TimePickerWrapper } from './styles';
import { WeightTicketSection } from './WeightTicketSection';

const I18N_PATH_ROOT = 'Text.';
const I18N_PATH = 'quickViews.DashboardDailyRouteEdit.Text.';
const I18N_PATH_VALIDATION = 'ValidationErrors.';
const I18N_PATH_PLACEHOLDERS = 'quickViews.DashboardDailyRouteEdit.Placeholders.';

interface IProps {
  dailyRoute: IDashboardDailyRoute;
}

const statusOptions = Object.values(DailyRouteStatus)
  .filter(value => value !== DailyRouteStatus.UPDATING)
  .map(value => value);

export const FormBase: React.FC<IProps> = observer(({ dailyRoute }) => {
  const { t } = useTranslation();
  const { serviceAreaStore, materialStore, haulingTrucksStore, haulingDriversStore } = useStores();
  const { values, errors, touched, initialValues, handleChange, setFieldValue, setFieldTouched } =
    useFormikContext<FormDataType>();
  const { formatDateTime } = useIntl();
  const { timeZone } = useTimeZone();

  const { truckId: selectedTruckId } = values;

  const onChangeFloatValue = useCallback(
    (e: React.ChangeEvent<TextInputElement>, fieldName: string) => {
      handleChange(e);

      const baseQuantity = Number(e.target.value);
      const newQuantity = floor(baseQuantity, 2);

      setFieldValue(fieldName, newQuantity ? newQuantity : null);
    },
    [handleChange, setFieldValue],
  );

  const handleOdometerStartChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      onChangeFloatValue(e, 'odometerStart');
    },
    [onChangeFloatValue],
  );

  const handleOdometerEndChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      onChangeFloatValue(e, 'odometerEnd');
    },
    [onChangeFloatValue],
  );

  useEffect(() => {
    const businessLineTypes = [dailyRoute.businessLineType as BusinessLineTypeSymbol];

    haulingTrucksStore.getHaulingTrucks(dailyRoute.businessUnitId, businessLineTypes);
  }, [dailyRoute, haulingTrucksStore]);

  useEffect(() => {
    if (!selectedTruckId) {
      return;
    }

    haulingDriversStore.getHaulingDrivers(dailyRoute.businessUnitId);
  }, [dailyRoute, selectedTruckId, haulingDriversStore]);

  const serviceAreas = useMemo(() => {
    const uniqueServiceAreaIds = [
      ...new Set(dailyRoute.workOrders.map(wo => wo.serviceAreaId).filter(Boolean)),
    ];

    if (uniqueServiceAreaIds.length === 0) {
      return;
    }

    const serviceAreasMapped = uniqueServiceAreaIds.map(id => {
      if (id) {
        return serviceAreaStore.getById(id)?.name;
      } else {
        return undefined;
      }
    });

    return serviceAreasMapped.length > 1 ? serviceAreasMapped.join(', ') : serviceAreasMapped[0];
  }, [serviceAreaStore, dailyRoute]);

  const materials = useMemo(() => {
    const uniqueMaterialIds = [
      ...new Set(dailyRoute.workOrders.map(wo => wo.materialId).filter(Boolean)),
    ];

    if (uniqueMaterialIds.length === 0) {
      return;
    }

    const materialsMapped = uniqueMaterialIds.map(id => {
      return materialStore.getById(id)?.description;
    });

    return materialsMapped.length > 1 ? materialsMapped.join(', ') : materialsMapped[0];
  }, [materialStore, dailyRoute]);

  const completedOnValue = useMemo(() => {
    return dailyRoute.completedAt
      ? formatDateTime(new Date(dailyRoute.completedAt), { timeZone }).popupDate
      : '–';
  }, [dailyRoute, formatDateTime, timeZone]);

  const serviceDateValue = useMemo(() => {
    return dailyRoute.serviceDate
      ? formatDateTime(new Date(dailyRoute.serviceDate)).popupDate
      : '–';
  }, [dailyRoute, formatDateTime]);

  const [inactiveDriver, inactiveTruck, nonUniqueDriver, nonUniqueTruck] = useMemo(
    () => [
      isRouteDriverInactive(dailyRoute),
      isRouteTruckInactive(dailyRoute),
      isDailyRouteDriverNonUnique(dailyRoute),
      isDailyRouteTruckNonUnique(dailyRoute),
    ],
    [dailyRoute],
  );

  const setTruckDriverTouched = (field: 'truckId' | 'driverId', value: string | number) => {
    setFieldValue(field, value);
    setFieldTouched(field, initialValues[field]?.toString() !== value.toString());
  };

  const shouldShowDriverViolation = (inactiveDriver || nonUniqueDriver) && !touched.driverId;
  const shouldShowTruckViolation = (inactiveTruck || nonUniqueTruck) && !touched.truckId;

  return (
    <>
      <FormInput
        name="name"
        label={`${t(`${I18N_PATH_ROOT}Route`)}*`}
        value={values.name}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}RouteName`)}
        onChange={handleChange}
        error={errors.name}
      />
      <StatusesSelect
        name="status"
        routeType="dashboard"
        label={t(`Text.Status`)}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}Status`)}
        value={values.status}
        onSelectChange={setFieldValue}
        statuses={statusOptions}
        noError={false}
      />
      <FormInput
        label={t(`${I18N_PATH}ServiceAreasLabel`)}
        placeholder="–"
        value={serviceAreas}
        name="serviceAreas"
        onChange={noop}
        disabled
      />
      <FormInput
        label={t(`${I18N_PATH}MaterialsLabel`)}
        placeholder="–"
        value={materials}
        name="materials"
        onChange={noop}
        disabled
      />
      <Layouts.Flex alignItems="center">
        <Select
          name="driverId"
          label={t(`${I18N_PATH}DriverLabel`)}
          placeholder={
            inactiveDriver
              ? haulingDriversStore.driverInfo?.name
              : t(`${I18N_PATH_PLACEHOLDERS}Driver`)
          }
          options={haulingDriversStore.getDropdownOptions(selectedTruckId, inactiveDriver)}
          value={inactiveDriver && !touched.driverId ? undefined : values.driverId}
          onSelectChange={setTruckDriverTouched}
          nonClearable
          error={errors.driverId}
        />
        {shouldShowDriverViolation && (
          <Layouts.Margin left="0.5">
            <WarningPreview
              position="left"
              text={t(
                `${I18N_PATH_VALIDATION}${
                  inactiveDriver ? 'RouteInactiveDriver' : 'RouteNonUniqueDriver'
                }`,
              )}
            />
          </Layouts.Margin>
        )}
      </Layouts.Flex>
      <FormInput
        name="serviceDate"
        label={t(`${I18N_PATH_ROOT}ServiceDate`)}
        value={serviceDateValue}
        placeholder="–"
        onChange={noop}
        disabled
      />
      <FormInput
        name="completedOn"
        label={t(`${I18N_PATH_ROOT}CompletedAt`)}
        value={completedOnValue}
        placeholder="–"
        onChange={noop}
        disabled
      />
      <Layouts.Margin bottom="3">
        <Divider />
      </Layouts.Margin>
      <TimePickerWrapper>
        <TimePicker
          label={t(`${I18N_PATH}ClockInLabel`)}
          name="clockIn"
          onChange={setFieldValue}
          value={values.clockIn}
          error={errors.clockIn}
        />
        <ReminderIcon />
      </TimePickerWrapper>
      <TimePickerWrapper>
        <TimePicker
          label={t(`${I18N_PATH}ClockOutLabel`)}
          name="clockOut"
          onChange={setFieldValue}
          value={values.clockOut}
          error={errors.clockOut}
        />
        <ReminderIcon />
      </TimePickerWrapper>
      <Layouts.Flex alignItems="center">
        <Select
          name="truckId"
          label={t(`${I18N_PATH}TruckLabel`)}
          placeholder={
            inactiveTruck ? haulingTrucksStore.truckInfo?.name : t(`${I18N_PATH_PLACEHOLDERS}Truck`)
          }
          options={haulingTrucksStore.getDropdownOptions(inactiveTruck)}
          value={(inactiveTruck && touched.truckId) || !values.truckId ? undefined : values.truckId}
          onSelectChange={setTruckDriverTouched}
          error={errors.truckId}
          nonClearable
        />
        {shouldShowTruckViolation && (
          <Layouts.Margin left="0.5">
            <WarningPreview
              position="left"
              text={t(
                `${I18N_PATH_VALIDATION}${
                  inactiveTruck ? 'RouteInactiveTruck' : 'RouteNonUniqueTruck'
                }`,
              )}
            />
          </Layouts.Margin>
        )}
      </Layouts.Flex>
      <FormInput
        type="number"
        name="odometerStart"
        label={t(`${I18N_PATH_ROOT}OdometerStart`)}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}OdometerStart`)}
        value={values.odometerStart}
        onChange={handleOdometerStartChange}
      />
      <FormInput
        type="number"
        name="odometerEnd"
        label={t(`${I18N_PATH_ROOT}OdometerEnd`)}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}OdometerEnd`)}
        value={values.odometerEnd}
        onChange={handleOdometerEndChange}
      />
      <Divider />
      <WeightTicketSection dailyRoute={dailyRoute} />
    </>
  );
});
