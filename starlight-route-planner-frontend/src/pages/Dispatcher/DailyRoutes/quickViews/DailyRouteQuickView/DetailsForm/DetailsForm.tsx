import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, Layouts, Select, SelectOptionsData } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { WarningPreview } from '@root/common';
import { BusinessLineTypeSymbol } from '@root/consts/businessLine';
import {
  isDailyRouteDriverNonUnique,
  isDailyRouteTruckNonUnique,
  isRouteDriverInactive,
  isRouteTruckInactive,
} from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { CalendarAdapter as Calendar } from '@root/widgets/CalendarAdapter/Calendar';

import { FormDataType } from '../formikData';

interface IDetailsForm {
  isEdited: boolean;
}

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH_VALIDATION = 'ValidationErrors.';
const I18N_PATH = 'quickViews.DailyRouteForm.DetailsTab.Text.';

export const DetailsForm: React.FC<IDetailsForm> = observer(({ isEdited }) => {
  const { dailyRoutesStore, haulingDriversStore, haulingTrucksStore } = useStores();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const { values, errors, initialValues, handleChange, setFieldValue } =
    useFormikContext<FormDataType>();

  const { truckId: selectedTruckId } = values;

  useEffect(() => {
    const businessLineTypes = isEdited
      ? [dailyRoutesStore.getDailyRouteByModalSettings?.businessLineType as BusinessLineTypeSymbol]
      : [BusinessLineTypeSymbol.C, BusinessLineTypeSymbol.R, BusinessLineTypeSymbol.PT];

    haulingTrucksStore.getHaulingTrucks(businessUnitId, businessLineTypes);
  }, [
    businessUnitId,
    isEdited,
    dailyRoutesStore.getDailyRouteByModalSettings?.businessLineType,
    haulingTrucksStore,
  ]);

  useEffect(() => {
    haulingDriversStore.getHaulingDrivers(businessUnitId);
  }, [businessUnitId, haulingDriversStore]);

  useEffect(() => {
    // Fetch color only when it`s creating
    if (!isEdited) {
      (async () => {
        const color = await dailyRoutesStore.getAvailableColor();

        if (color) {
          setFieldValue('color', color);
        }
      })();
    }
  }, [dailyRoutesStore, isEdited, setFieldValue]);

  useEffect(() => {
    // If truck id is null this mean that user cleared truck select and we need to clear driver select also
    if (values.truckId === undefined) {
      setFieldValue('driverId', null);
    }
  }, [values.truckId, setFieldValue]);

  const [inactiveDriver, inactiveTruck, nonUniqueDriver, nonUniqueTruck] = useMemo(() => {
    const dailyRoute = dailyRoutesStore.getDailyRouteByModalSettings;

    return isEdited
      ? [
          isRouteDriverInactive(dailyRoute),
          isRouteTruckInactive(dailyRoute),
          isDailyRouteDriverNonUnique(dailyRoute),
          isDailyRouteTruckNonUnique(dailyRoute),
        ]
      : [false, false, false, false];
  }, [isEdited, dailyRoutesStore.getDailyRouteByModalSettings]);

  const shouldShowTruckViolation = useMemo(() => {
    return (
      (inactiveTruck || nonUniqueTruck) &&
      initialValues.truckId?.toString() === values.truckId?.toString()
    );
  }, [initialValues.truckId, inactiveTruck, nonUniqueTruck, values.truckId]);

  const shouldShowDriverViolation = useMemo(() => {
    return (
      (inactiveDriver || nonUniqueDriver) &&
      initialValues.driverId?.toString() === values.driverId?.toString()
    );
  }, [initialValues.driverId, inactiveDriver, nonUniqueDriver, values.driverId]);

  return (
    <>
      <FormInput
        name="name"
        label={t(`${I18N_PATH}RouteName`)}
        placeholder={t(`${I18N_PATH}RouteNamePlaceholder`)}
        value={values.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Calendar
        readOnly
        name="serviceDate"
        label={t(`${I18N_ROOT_PATH}ServiceDate`)}
        value={values.serviceDate}
        placeholder={t(`${I18N_PATH}ScheduledPlaceholder`)}
        onDateChange={setFieldValue}
        withInput
      />
      <Layouts.Flex alignItems="center">
        <Select
          name="truckId"
          label={t(`${I18N_PATH}TruckId`)}
          placeholder={
            inactiveTruck ? haulingTrucksStore.truckInfo?.name : t(`${I18N_PATH}TruckIdPlaceholder`)
          }
          options={haulingTrucksStore.getDropdownOptions(inactiveTruck)}
          value={inactiveTruck ? undefined : values.truckId}
          onSelectChange={setFieldValue}
          error={errors.truckId}
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
      <Layouts.Flex alignItems="center">
        <Select
          name="driverId"
          label={t(`${I18N_PATH}DriverId`)}
          placeholder={
            inactiveDriver
              ? haulingDriversStore.driverInfo?.name
              : t(`${I18N_PATH}DriverIdPlaceholder`)
          }
          options={
            haulingDriversStore.getDropdownOptions(
              selectedTruckId,
              inactiveDriver,
            ) as SelectOptionsData
          }
          value={inactiveDriver ? undefined : values.driverId}
          onSelectChange={setFieldValue}
          error={errors.driverId}
          disabled={!values.truckId}
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
    </>
  );
});
