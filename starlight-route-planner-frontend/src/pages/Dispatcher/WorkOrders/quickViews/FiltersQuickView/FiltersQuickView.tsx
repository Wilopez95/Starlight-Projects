import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormContainerLayout,
  ISelectOption,
  Layouts,
  Select,
  SelectValue,
  Typography,
} from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { IWorkOrdersParams } from '@root/api/workOrders';
import { MultiCheckBoxSelect, StatusesSelect } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { availableWorkOrdersStatuses } from '@root/config';
import { WorkOrderStatus } from '@root/consts/workOrder';
import { useBusinessContext, useStores } from '@root/hooks';
import { QuickView } from '@root/quickViews';

import { defaultValues } from './formikData';

const I18N_PATH = 'quickViews.FiltersView.Text.';
const I18N_PATH_ROOT = 'Text.';

interface IFiltersQuickView {
  onClose: () => void;
  onSubmitFiltersOptions: (filterOptions: Omit<IWorkOrdersParams, 'serviceDate'>) => void;
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const FiltersQuickView: React.FC<IFiltersQuickView> = ({
  onSubmitFiltersOptions,
  mainContainerRef,
  onClose,
}) => {
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const { workOrdersStore, businessLineStore, serviceAreaStore, haulerStore } = useStores();
  const [assignedDailyRoutesList, setAssignedDailyRoutesList] = useState<ISelectOption[]>([]);

  const statusOptions = useMemo(() => {
    return Object.values(WorkOrderStatus)
      .map(value => value)
      .filter(status => availableWorkOrdersStatuses.includes(status));
  }, []);

  const formik = useFormik({
    initialValues: defaultValues,
    enableReinitialize: true,
    onSubmit: onSubmitFiltersOptions,
  });

  const loadFilters = useCallback(
    (businessLineIds: number[]) => {
      serviceAreaStore.cleanup();

      serviceAreaStore.getHaulingServiceAreas(businessUnitId, businessLineIds);
    },
    [serviceAreaStore, businessUnitId],
  );

  const { values, setFieldValue, submitForm, resetForm } = formik;

  useEffect(() => {
    setFieldValue('serviceAreaIds', undefined);
    if (values.businessLineIds?.length) {
      loadFilters(values.businessLineIds);
    } else {
      const ids = businessLineStore.getDropdownOptions.map(lob => lob.value);

      loadFilters(ids);
    }
  }, [values.businessLineIds, businessLineStore.getDropdownOptions, loadFilters, setFieldValue]);

  useEffect(() => {
    const load = async () => {
      const dailyRoutes = await workOrdersStore.getDailyRoutesList(businessUnitId, {
        serviceDate: workOrdersStore.serviceDate,
      });

      const noAssignedRouteOption: ISelectOption = {
        label: t(`${I18N_PATH}NoAssignedRoute`),
        // Set default to ""
        value: '',
      };

      const assignedList = dailyRoutes.map(dailyRoute => ({
        label: dailyRoute.name,
        value: dailyRoute.name,
      }));

      setAssignedDailyRoutesList([noAssignedRouteOption, ...assignedList]);
    };

    load();
  }, [businessUnitId, workOrdersStore, workOrdersStore.serviceDate, t]);

  const onReset = useCallback(() => {
    resetForm();
    submitForm();
  }, [resetForm, submitForm]);

  return (
    <QuickView
      condition={workOrdersStore.isOpenQuickView}
      clickOutHandler={onClose}
      parentRef={mainContainerRef}
    >
      {({ onAddRef, scrollContainerHeight }) => (
        <>
          <Layouts.Box ref={onAddRef} position="relative">
            <Layouts.Padding left="3" right="3">
              <Typography color="default" as="label" shade="standard" variant="headerThree">
                {t(`${I18N_PATH}Title`)}
              </Typography>
            </Layouts.Padding>
          </Layouts.Box>
          <Layouts.Scroll height={scrollContainerHeight}>
            <FormContainerLayout formik={formik}>
              <Layouts.Padding left="3" right="3" bottom="3">
                <Layouts.Box width="100%">
                  <MultiCheckBoxSelect
                    name="businessLineIds"
                    label={t(`${I18N_PATH}LineOfBusinessLabeL`)}
                    placeholder={t(`${I18N_PATH}LineOfBusinessPlaceholder`)}
                    options={businessLineStore.getDropdownOptions}
                    values={values.businessLineIds}
                    onSelectChange={setFieldValue}
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <MultiCheckBoxSelect
                    name="serviceAreaIds"
                    label={t(`${I18N_PATH}ServiceAreaLabel`)}
                    placeholder={t(`${I18N_PATH}ServiceAreaPlaceholder`)}
                    options={serviceAreaStore.getDropdownOptions}
                    values={values.serviceAreaIds}
                    onSelectChange={setFieldValue}
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <StatusesSelect
                    multiple
                    routeType="work-orders"
                    name="status"
                    label={t(`Text.Status`)}
                    placeholder={t(`${I18N_PATH}StatusPlaceholder`)}
                    values={values.status}
                    onSelectChange={setFieldValue}
                    statuses={statusOptions}
                    noError
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <Select
                    name="assignedRoute"
                    label={t(`${I18N_PATH}AssignedDailyRouteId`)}
                    placeholder={t(`Text.Select`)}
                    options={assignedDailyRoutesList}
                    value={values.assignedRoute}
                    onSelectChange={setFieldValue}
                    noErrorMessage
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <MultiCheckBoxSelect
                    name="thirdPartyHaulerIds"
                    label={t(`${I18N_PATH_ROOT}3pHauler`)}
                    placeholder={t(`${I18N_PATH_ROOT}3pHauler`)}
                    options={[
                      {
                        label: t(`${I18N_PATH_ROOT}No3pHauler`),
                        value: 0,
                      },
                      ...haulerStore.getHaulerOptions,
                    ]}
                    values={values.thirdPartyHaulerIds as SelectValue[]}
                    onSelectChange={setFieldValue}
                  />
                </Layouts.Box>
              </Layouts.Padding>
            </FormContainerLayout>
          </Layouts.Scroll>
          <Layouts.Box ref={onAddRef} position="relative">
            <Divider />
            <Layouts.Padding top="2" bottom="2" left="3" right="3">
              <Layouts.Flex justifyContent="space-between">
                <Button onClick={onReset}>{t(`${I18N_PATH}ResetAll`)}</Button>
                <Button variant="primary" onClick={submitForm}>
                  {t(`${I18N_PATH}ApplyFilters`)}
                </Button>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Box>
        </>
      )}
    </QuickView>
  );
};

export default observer(FiltersQuickView);
