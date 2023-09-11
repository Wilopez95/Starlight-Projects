import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { WarningPreview } from '@root/common';
import { BusinessLineTypeSymbol } from '@root/consts/businessLine';
import { isRouteDriverInactive, isRouteTruckInactive } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import { IMasterRouteCustomizedFormValues } from '../types';

const I18N_PATH = 'quickViews.MasterRouteView.DetailsTab.Text.';
const I18N_PATH_VALIDATION = 'ValidationErrors.';

interface IDetailsForm {
  isEdited: boolean;
}

export const DetailsForm: React.FC<IDetailsForm> = observer(({ isEdited }) => {
  const { masterRoutesStore, haulingDriversStore, haulingTrucksStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { values, errors, initialValues, handleChange, setFieldValue } =
    useFormikContext<IMasterRouteCustomizedFormValues>();
  const { t } = useTranslation();

  const { truckId: selectedTruckId } = values;

  useEffect(() => {
    const businessLineTypes = isEdited
      ? [
          masterRoutesStore.getMasterRouteByModalSettings
            ?.businessLineType as BusinessLineTypeSymbol,
        ]
      : [BusinessLineTypeSymbol.C, BusinessLineTypeSymbol.R, BusinessLineTypeSymbol.PT];

    haulingTrucksStore.getHaulingTrucks(businessUnitId, businessLineTypes);
  }, [
    businessUnitId,
    isEdited,
    masterRoutesStore.getMasterRouteByModalSettings?.businessLineType,
    haulingTrucksStore,
  ]);

  useEffect(() => {
    haulingDriversStore.getHaulingDrivers(businessUnitId);
  }, [businessUnitId, haulingDriversStore]);

  const handleNullableSelect = useCallback(
    (name: 'truckId' | 'driverId', value) => {
      setFieldValue(name, value === '' ? null : value);
    },
    [setFieldValue],
  );

  useEffect(() => {
    // Fetch color only when it`s creating
    if (!isEdited) {
      (async () => {
        const color = await masterRoutesStore.getAvailableColor();

        if (color) {
          setFieldValue('color', color);
        }
      })();
    }
  }, [masterRoutesStore, isEdited, setFieldValue]);

  useEffect(() => {
    // If truck id is null this mean that user cleared truck select and we need to clear driver select also
    if (values.truckId === undefined) {
      setFieldValue('driverId', undefined);
    }
  }, [values.truckId, setFieldValue]);

  const [inactiveDriver, inactiveTruck] = useMemo(() => {
    const masterRoute = masterRoutesStore.getMasterRouteByModalSettings;

    return isEdited
      ? [isRouteDriverInactive(masterRoute), isRouteTruckInactive(masterRoute)]
      : [false, false];
  }, [isEdited, masterRoutesStore.getMasterRouteByModalSettings]);

  const shouldShowDriverViolation = useMemo(() => {
    return inactiveDriver && initialValues.driverId?.toString() === values.driverId?.toString();
  }, [inactiveDriver, initialValues.driverId, values.driverId]);

  const shouldShowTruckViolation = useMemo(() => {
    return inactiveTruck && initialValues.truckId?.toString() === values.truckId?.toString();
  }, [inactiveTruck, initialValues.truckId, values.truckId]);

  return (
    <>
      <FormInput
        name="name"
        label={t(`${I18N_PATH}RouteNameLabel`)}
        placeholder={t(`${I18N_PATH}RouteNamePlaceholder`)}
        value={values.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Layouts.Flex alignItems="center">
        <Select
          name="truckId"
          label={t(`${I18N_PATH}TruckIdLabel`)}
          placeholder={
            shouldShowTruckViolation
              ? haulingTrucksStore.truckInfo?.name
              : t(`${I18N_PATH}TruckIdPlaceholder`)
          }
          options={haulingTrucksStore.getDropdownOptions(inactiveTruck)}
          value={shouldShowTruckViolation ? undefined : values.truckId}
          onSelectChange={handleNullableSelect}
          error={errors.truckId}
        />
        {shouldShowTruckViolation && (
          <Layouts.Margin left="0.5">
            <WarningPreview position="left" text={t(`${I18N_PATH_VALIDATION}RouteInactiveTruck`)} />
          </Layouts.Margin>
        )}
      </Layouts.Flex>
      <Layouts.Flex alignItems="center">
        <Select
          name="driverId"
          label={t(`${I18N_PATH}DriverLabel`)}
          placeholder={
            shouldShowDriverViolation
              ? haulingDriversStore.driverInfo?.name
              : t(`${I18N_PATH}DriverPlaceholder`)
          }
          options={
            haulingDriversStore.getDropdownOptions(
              selectedTruckId,
              inactiveDriver,
            ) as ISelectOption[]
          }
          value={shouldShowDriverViolation ? undefined : values.driverId}
          onSelectChange={handleNullableSelect}
          error={errors.driverId}
          disabled={!values.truckId}
        />
        {shouldShowDriverViolation && (
          <Layouts.Margin left="0.5">
            <WarningPreview
              position="left"
              text={t(`${I18N_PATH_VALIDATION}RouteInactiveDriver`)}
            />
          </Layouts.Margin>
        )}
      </Layouts.Flex>
    </>
  );
});
