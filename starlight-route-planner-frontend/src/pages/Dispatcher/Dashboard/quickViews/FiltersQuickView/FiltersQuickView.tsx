import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormContainerLayout, Layouts, Typography } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { IDashboardParams } from '@root/api';
import { MultiCheckBoxSelect, StatusesSelect } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { businessLinesByType, DailyRouteStatus } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { QuickView } from '@root/quickViews';

import { defaultValues, statusOptions } from './formikData';

const I18N_PATH = 'quickViews.FiltersView.Text.';

interface IFiltersQuickView {
  onClose: () => void;
  onSubmitFiltersOptions: (filterOptions: Omit<IDashboardParams, 'serviceDate'>) => void;
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const FiltersQuickView: React.FC<IFiltersQuickView> = ({
  onSubmitFiltersOptions,
  mainContainerRef,
  onClose,
}) => {
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const {
    dashboardStore,
    materialStore,
    serviceAreaStore,
    businessLineStore,
    businessUnitStore,
    haulingTruckTypesStore,
  } = useStores();

  const businessLinesList = useMemo(() => businessLinesByType(t), [t]);

  const formik = useFormik({
    initialValues: defaultValues,
    enableReinitialize: true,
    onSubmit: onSubmitFiltersOptions,
  });

  const { values, setFieldValue, submitForm, resetForm } = formik;

  const loadFilters = useCallback(async () => {
    if (!businessUnitStore.selectedEntity) {
      await businessUnitStore.request();
    }

    Promise.all([
      serviceAreaStore.getHaulingServiceAreas(
        businessUnitId,
        businessLineStore.currentBusinessLines.map(({ id }) => id),
      ),
      haulingTruckTypesStore.getTruckTypes(),
      materialStore.getHaulingMaterials({}),
    ]);
  }, [
    businessLineStore.currentBusinessLines,
    businessUnitId,
    businessUnitStore,
    serviceAreaStore,
    materialStore,
    haulingTruckTypesStore,
  ]);

  useEffect(() => {
    //if (dashboardStore.serviceDate) {
    loadFilters();
    //}
  }, [
    businessLineStore,
    dashboardStore,
    dashboardStore.serviceDate,
    loadFilters,
    values.serviceAreaIds,
  ]);

  const onReset = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // TODO maybe extend current serviceAreaStore.getDropdownOptions
  const serviceAreaOptions = useMemo(
    () =>
      serviceAreaStore.values.map(({ id, name: serviceAreaName, businessLineId }) => ({
        label: `${businessLineStore.getById(businessLineId)?.name ?? ''} - ${serviceAreaName}`,
        value: id,
      })),
    [businessLineStore, serviceAreaStore.values],
  );

  return (
    <QuickView
      condition={dashboardStore.isOpenQuickView}
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
                    name="businessLineTypes"
                    label={t(`${I18N_PATH}LineOfBusinessLabeL`)}
                    placeholder={t(`${I18N_PATH}LineOfBusinessPlaceholder`)}
                    options={businessLinesList}
                    values={values.businessLineTypes}
                    onSelectChange={setFieldValue}
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <MultiCheckBoxSelect
                    name="serviceAreaIds"
                    label={t(`${I18N_PATH}ServiceAreaLabel`)}
                    placeholder={t(`${I18N_PATH}ServiceAreaPlaceholder`)}
                    options={serviceAreaOptions}
                    values={values.serviceAreaIds}
                    onSelectChange={setFieldValue}
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <StatusesSelect
                    multiple
                    routeType="dashboard"
                    name="statuses"
                    label={t(`Text.Status`)}
                    placeholder={t(`${I18N_PATH}StatusPlaceholder`)}
                    values={values.statuses}
                    onSelectChange={setFieldValue}
                    statuses={statusOptions as DailyRouteStatus[]}
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <MultiCheckBoxSelect
                    name="truckTypes"
                    label={t(`${I18N_PATH}TruckType`)}
                    placeholder={t(`Text.Select`)}
                    options={haulingTruckTypesStore.getDropdownOptions}
                    values={values.truckTypes}
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
