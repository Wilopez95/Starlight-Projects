import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormContainer,
  Layouts,
  Select,
  Switch,
  Typography,
} from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { IWorkOrdersDailyRouteParams } from '@root/api/workOrdersDailyRoute';
import { MultiCheckBoxSelect } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';
import { useDailyRoutesMap } from '@root/providers/DailyRoutesMapProvider';
import { QuickView } from '@root/quickViews';

import { defaultValues } from './formikData';
import * as Styles from './styles';

const I18N_PATH = 'quickViews.MasterRouteFiltersView.Text.';
const I18N_PATH_ROOT = 'Text.';
const FILTERS_RESET_KEYS = ['serviceAreaIds', 'materialIds', 'equipmentItemIds'];

interface IFiltersQuickView {
  onSubmitFiltersOptions: (data: Omit<IWorkOrdersDailyRouteParams, 'serviceDate'>) => void;
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
    dailyRoutesStore,
  } = useStores();

  const { businessUnitId } = useBusinessContext();

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

  const { setShowUnassignedJobSite, showUnassignedJobSite } = useDailyRoutesMap();

  const formik = useFormik({
    initialValues: defaultValues(businessLineStore.getDropdownOptions[0]?.value),
    enableReinitialize: true,
    onSubmit: onSubmitFiltersOptions,
  });

  const { values, setFieldValue, submitForm, resetForm } = formik;

  useEffect(() => {
    if (values.businessLineId) {
      FILTERS_RESET_KEYS.forEach(key => {
        setFieldValue(key, []);
      });
      loadFilters(values.businessLineId);
    }
  }, [loadFilters, setFieldValue, values.businessLineId]);

  const toggleSwitch = useCallback(() => {
    setShowUnassignedJobSite(!showUnassignedJobSite);
  }, [setShowUnassignedJobSite, showUnassignedJobSite]);

  const onReset = useCallback(() => {
    resetForm();
    submitForm();
  }, [resetForm, submitForm]);

  return (
    <QuickView
      condition={dailyRoutesStore.isFiltersModalOpen}
      clickOutHandler={onClose}
      parentRef={mainContainerRef}
      clickOutSelectors={['#navigation-typography']}
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
                <Layouts.Margin top="2" bottom="2">
                  <Layouts.Flex>
                    <Switch
                      name="showUnassignedJSites"
                      onChange={toggleSwitch}
                      value={showUnassignedJobSite}
                    >
                      <Layouts.Flex alignItems="center">
                        <Layouts.Padding right="1">
                          {t(`${I18N_PATH}UnassignedSwitch`)}
                        </Layouts.Padding>
                        <Styles.UnassignedIcon />
                      </Layouts.Flex>
                    </Switch>
                  </Layouts.Flex>
                </Layouts.Margin>
                <Layouts.Box width="100%">
                  <Select
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
                    name="equipmentItemIds"
                    label={t(`${I18N_PATH}EquipmentSizeLabel`)}
                    placeholder={t(`${I18N_PATH}EquipmentSizePlaceholder`)}
                    options={equipmentItemStore.getDropdownOptions}
                    values={values.equipmentItemIds}
                    onSelectChange={setFieldValue}
                  />
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
