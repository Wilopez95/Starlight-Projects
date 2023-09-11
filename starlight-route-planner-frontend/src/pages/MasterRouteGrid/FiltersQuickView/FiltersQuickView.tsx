import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormContainer, Layouts, Typography } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { IHaulingServiceItemsParams } from '@root/api/haulingServiceItems/types';
import { MultiCheckBoxSelect, ServiceDays } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { FREQUENCY } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { QuickView } from '@root/quickViews';

import { defaultValues } from './formikData';
import * as Styles from './styles';

const I18N_PATH = 'quickViews.MasterRouteFiltersView.Text.';
const I18N_PATH_ROOT = 'Text.';
const FILTERS_RESET_KEYS = ['serviceAreaIds', 'materialIds', 'equipmentIds'];

interface IFiltersQuickView {
  onSubmitFiltersOptions: (data: IHaulingServiceItemsParams) => void;
  onClose: () => void;
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

const FiltersQuickView: React.FC<IFiltersQuickView> = ({
  onSubmitFiltersOptions,
  onClose,
  mainContainerRef,
}) => {
  const { t } = useTranslation();
  const {
    businessLineStore,
    serviceAreaStore,
    materialStore,
    equipmentItemStore,
    masterRoutesStore,
  } = useStores();
  const { businessUnitId } = useBusinessContext();

  // When LOB is we can fetch next filters
  const loadFilters = useCallback(
    (businessLineId: number) => {
      serviceAreaStore.cleanup();
      materialStore.cleanup();
      equipmentItemStore.cleanup();

      Promise.all([
        serviceAreaStore.getHaulingServiceAreas(businessUnitId, [businessLineId]),
        materialStore.getHaulingMaterials({ businessLineId }),
        equipmentItemStore.getHaulingEquipmentItems(businessLineId),
      ]);
    },
    [serviceAreaStore, materialStore, equipmentItemStore, businessUnitId],
  );

  const formik = useFormik({
    initialValues: defaultValues(businessLineStore.getDropdownOptions[0]?.value),
    enableReinitialize: true,
    onSubmit: onSubmitFiltersOptions,
  });

  const { values, setFieldValue, submitForm, resetForm } = formik;
  const masterRoutesList = masterRoutesStore.values.map(item => ({
    value: item.id,
    label: item.name,
  }));
  useEffect(() => {
    if (values.businessLineId) {
      FILTERS_RESET_KEYS.forEach(key => {
        setFieldValue(key, []);
      });
      loadFilters(values.businessLineId);
    }
  }, [loadFilters, setFieldValue, values.businessLineId]);

  const onReset = useCallback(() => {
    resetForm();
    submitForm();
  }, [resetForm, submitForm]);

  return (
    <QuickView
      condition={masterRoutesStore.isFiltersModalOpen}
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
            <FormContainer formik={formik}>
              <Layouts.Padding left="3" right="3" bottom="3">
                <Layouts.Box width="100%">
                  <Styles.Select
                    name="businessLineId"
                    label={t(`${I18N_PATH}LineOfBusinessLabeL`)}
                    placeholder={t(`${I18N_PATH}LineOfBusinessPlaceholder`)}
                    options={businessLineStore.getDropdownOptions}
                    value={values.businessLineId}
                    onSelectChange={setFieldValue}
                    noErrorMessage
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <Styles.Select
                    name="routeId"
                    label={t(`${I18N_PATH}Route`)}
                    placeholder={t(`${I18N_PATH}RoutePlaceholder`)}
                    options={masterRoutesList}
                    value={values.routeId}
                    onSelectChange={setFieldValue}
                    noErrorMessage
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
                  <MultiCheckBoxSelect
                    name="materialIds"
                    label={t(`${I18N_PATH_ROOT}Material`)}
                    placeholder={t(`${I18N_PATH}MaterialTypePlaceholder`)}
                    options={materialStore.getDropdownOptions}
                    values={values.materialIds}
                    onSelectChange={setFieldValue}
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <MultiCheckBoxSelect
                    name="equipmentIds"
                    label={t(`${I18N_PATH}EquipmentSizeLabel`)}
                    placeholder={t(`${I18N_PATH}EquipmentSizePlaceholder`)}
                    options={equipmentItemStore.getDropdownOptions}
                    values={values.equipmentIds}
                    onSelectChange={setFieldValue}
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <MultiCheckBoxSelect
                    name="frequencyIds"
                    label={t(`${I18N_PATH}FrequencyLabel`)}
                    placeholder={t(`${I18N_PATH}FrequencyPlaceholder`)}
                    options={FREQUENCY}
                    values={values.frequencyIds}
                    defaultValues={[]}
                    onSelectChange={setFieldValue}
                  />
                </Layouts.Box>
                <Layouts.Margin top="2" />
                <Layouts.Box width="100%">
                  <ServiceDays />
                </Layouts.Box>
              </Layouts.Padding>
            </FormContainer>
          </Layouts.Scroll>
          <Layouts.Box ref={onAddRef} position="relative">
            <Divider />
            <Layouts.Padding top="2" bottom="2" left="3" right="3">
              <Layouts.Flex justifyContent="space-between">
                <Button onClick={onReset}>{t(`${I18N_PATH}Reset`)}</Button>
                <Button variant="primary" onClick={submitForm}>
                  {t(`${I18N_PATH}Apply`)}
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
