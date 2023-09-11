import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormInput,
  ISelectOption,
  Layouts,
  Select,
  TextInputElement,
} from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { useFormikContext } from 'formik';
import { floor, noop } from 'lodash-es';

import { StatusesSelect } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { availableWorkOrdersStatuses } from '@root/config';
import { BusinessLineType, BusinessLineTypeSymbol, DateFormat } from '@root/consts';
import { WorkOrderStatus } from '@root/consts/workOrder';
import { useBusinessContext, useStores } from '@root/hooks';
import { IWorkOrder } from '@root/types';
import { CalendarAdapter as Calendar } from '@root/widgets/CalendarAdapter/Calendar';

import { FormDataType } from './formikData';
import { MediaFilesSection } from './MediaFilesSection';

const I18N_PATH_ROOT = 'Text.';
const I18N_PATH_PLACEHOLDERS = 'quickViews.WorkOrderEdit.Placeholders.';
const PLACEHOLDER = '-';

interface IProps {
  workOrder: IWorkOrder;
  setCancellationReasonModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FormBase: React.FC<IProps> = ({ workOrder, setCancellationReasonModalOpen }) => {
  const { t } = useTranslation();
  const { values, errors, handleChange, setFieldValue } = useFormikContext<FormDataType>();
  const { dailyRoutesStore, businessLineStore, haulerStore, haulingTrucksStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [dailyRoutesSelectValues, setDailyRoutesSelectValues] = useState<ISelectOption[]>([]);
  const { dailyRoute } = workOrder;

  const driverName = dailyRoute ? dailyRoute.driverName : undefined;

  const workOrderType = useMemo(() => {
    return businessLineStore.getById(workOrder.businessLineId)?.type ===
      BusinessLineType.portableToilets
      ? [BusinessLineTypeSymbol.PT]
      : [BusinessLineTypeSymbol.C, BusinessLineTypeSymbol.R, BusinessLineTypeSymbol.CR];
  }, [businessLineStore, workOrder]);

  useEffect(() => {
    (async () => {
      const dailyRoutes =
        (await dailyRoutesStore.getDailyRouteNamesList(businessUnitId, {
          serviceDate: format(values.serviceDate, DateFormat.DateSerialized),
          businessLineTypes: workOrderType,
        })) ?? [];

      const dailyRouteOptions: ISelectOption[] = dailyRoutes.map(({ name }) => {
        return {
          label: name,
          value: name,
        };
      });

      setDailyRoutesSelectValues(dailyRouteOptions);
    })();
  }, [
    businessUnitId,
    dailyRoutesStore,
    setDailyRoutesSelectValues,
    values.serviceDate,
    workOrderType,
  ]);

  useEffect(() => {
    if (!dailyRoutesSelectValues.length) {
      return;
    }

    const selectedRoute = dailyRoutesSelectValues.find(
      route => route.value === values.assignedRoute,
    );

    setFieldValue('assignedRoute', selectedRoute?.value ?? null);
  }, [dailyRoutesSelectValues, values.assignedRoute, setFieldValue]);

  const handleStatusChange = useCallback(
    (fieldName: string, value: string) => {
      if (value === WorkOrderStatus.CANCELED) {
        setCancellationReasonModalOpen(true);
      } else {
        setFieldValue(fieldName, value);
      }
    },
    [setCancellationReasonModalOpen, setFieldValue],
  );

  const onChangeWeight = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      handleChange(e);

      const baseQuantity = Number(e.target.value);
      const newQuantity = floor(baseQuantity, 2);

      setFieldValue('weight', newQuantity ? newQuantity : null);
    },
    [handleChange, setFieldValue],
  );

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      handleChange(e);

      const name = e.target.name;
      const value = e.target.value;

      setFieldValue(name, value || null);
    },
    [handleChange, setFieldValue],
  );

  return (
    <>
      <Select
        name="3pHauler"
        label={t(`${I18N_PATH_ROOT}3pHauler`)}
        placeholder={t(`${I18N_PATH_ROOT}3pHauler`)}
        nonClearable
        options={[
          {
            label: '-',
            value: '',
          },
          ...haulerStore.getHaulerOptions,
        ]}
        value={haulerStore.getActiveHaulerValue(workOrder.thirdPartyHaulerId)}
        onSelectChange={noop}
        disabled
      />
      <Select
        name="assignedRoute"
        label={t(`${I18N_PATH_ROOT}DailyRoute`)}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}DailyRoute`)}
        nonClearable
        options={dailyRoutesSelectValues}
        value={values.assignedRoute}
        onSelectChange={setFieldValue}
        disabled={!!workOrder.thirdPartyHaulerId}
      />
      <Calendar
        name="serviceDate"
        label={t(`${I18N_PATH_ROOT}ScheduledOn`)}
        value={values.serviceDate}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}ScheduledOn`)}
        onDateChange={setFieldValue}
        withInput
      />
      <Calendar
        name="completedOn"
        label={t(`${I18N_PATH_ROOT}CompletedOn`)}
        value={workOrder.completedAt ? new Date(workOrder.completedAt) : undefined}
        onDateChange={noop}
        withInput
        readOnly
        disabled
        placeholder={PLACEHOLDER}
      />
      <StatusesSelect
        routeType="work-orders"
        name="status"
        label={t(`${I18N_PATH_ROOT}Status`)}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}Status`)}
        nonClearable
        statuses={availableWorkOrdersStatuses}
        value={values.status}
        onSelectChange={handleStatusChange}
        error={errors.status}
        noError={false}
      />
      <Select
        name="driverName"
        label={t(`${I18N_PATH_ROOT}DriverName`)}
        placeholder={driverName}
        nonClearable
        options={[]}
        value={undefined}
        onSelectChange={noop}
        disabled
      />
      <Select
        name="truckId"
        label={t(`${I18N_PATH_ROOT}TruckId`)}
        placeholder={haulingTrucksStore.truckInfo?.name}
        nonClearable
        options={[]}
        value={undefined}
        onSelectChange={noop}
        disabled
      />
      <FormInput
        name="instructionsForDriver"
        label={t(`${I18N_PATH_ROOT}InstructionsForDriver`)}
        placeholder={PLACEHOLDER}
        value={workOrder.instructionsForDriver}
        onChange={noop}
        disabled
        area
      />
      <Divider />
      <MediaFilesSection />
      <Layouts.Margin top="2">
        <Divider />
      </Layouts.Margin>
      <Layouts.Margin top="2" />
      <FormInput
        name="pickedUpEquipment"
        label={t(`${I18N_PATH_ROOT}PickedUpEquipmentNumber`)}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}PickedUpEquipmentNumber`)}
        value={values.pickedUpEquipment}
        onChange={handleFieldChange}
      />
      <FormInput
        name="droppedEquipment"
        label={t(`${I18N_PATH_ROOT}DroppedEquipmentNumber`)}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}DroppedEquipmentNumber`)}
        value={values.droppedEquipment}
        onChange={handleFieldChange}
      />
      <FormInput
        type="number"
        name="weight"
        label={`${t(`${I18N_PATH_ROOT}Weight`)} ${
          workOrder.weightUnit ? `(${workOrder.weightUnit})` : ''
        }`}
        placeholder={t(`${I18N_PATH_PLACEHOLDERS}Weight`)}
        value={values.weight}
        onChange={onChangeWeight}
      />
    </>
  );
};
