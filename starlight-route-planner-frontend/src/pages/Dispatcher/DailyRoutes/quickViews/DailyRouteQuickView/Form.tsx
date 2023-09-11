import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormContainer,
  Layouts,
  Navigation,
  NavigationConfigItem,
} from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';

import { Divider } from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';
import { QuickViewHeaderTitle } from '@root/quickViews';

import { DetailsForm, detailsValidationSchema } from './DetailsForm';
import { FormDataType, getInitialValues } from './formikData';
import { normalizeCreateDailyRoute, normalizeUpdateDailyRoute } from './normalize';
import { WorkOrdersForm, workOrdersValidationSchema } from './WorkOrdersForm';

export type DailyRouteConfigType = 'details' | 'workOrders';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'quickViews.DailyRouteForm.Text.';

interface IForm {
  onAddRef: (ref: HTMLElement | null) => void;
  scrollContainerHeight: number;
  onClose: () => void;
}

export const Form: React.FC<IForm> = ({ onAddRef, onClose, scrollContainerHeight }) => {
  const { dailyRoutesStore } = useStores();

  const { id, activeTabIndex } = dailyRoutesStore.dailyRouteModalSettings;

  const [currentTabIndex, setCurrentTabIndex] = useState<0 | 1>(activeTabIndex ?? 0);
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();

  const isEdited = useMemo(() => !!id, [id]);

  const tabs = [
    {
      Component: DetailsForm,
      validationSchema: detailsValidationSchema(t),
      validateOnChange: false,
    },
    {
      Component: WorkOrdersForm,
      validationSchema: workOrdersValidationSchema(t),
      validateOnChange: true,
    },
  ];

  const currentRoute = dailyRoutesStore.getDailyRouteByModalSettings;

  const onFormSubmit = useCallback(
    async (values: FormDataType, { setFieldError }: FormikHelpers<FormDataType>) => {
      let result;

      if (isEdited) {
        const normalizedFormData = normalizeUpdateDailyRoute(values);

        result = await dailyRoutesStore.updateDailyRoute(businessUnitId, normalizedFormData);
      } else {
        const normalizedFormData = normalizeCreateDailyRoute(values);

        result = await dailyRoutesStore.createDailyRoute(businessUnitId, normalizedFormData);
      }

      if (result) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await onTabChange(dailyRoutesTabsConfig[0]);
        setFieldError('name', t(`${I18N_ROOT_PATH}RouteNameExists`, { name: values.name }));

        return;
      }

      onClose();
    },

    [isEdited, businessUnitId, dailyRoutesStore, onClose, t],
  );

  const { Component, ...rest } = tabs[currentTabIndex];

  const formik = useFormik({
    initialValues: getInitialValues(currentRoute, dailyRoutesStore.selectedServiceDate),
    onSubmit: onFormSubmit,
    enableReinitialize: true,
    ...rest,
  });

  const { resetForm, handleSubmit, validateForm, values } = formik;

  const dailyRoutesTabsConfig: NavigationConfigItem<DailyRouteConfigType>[] = useMemo(() => {
    return [
      {
        label: t(`${I18N_PATH}TabDetailsTitle`),
        key: 'details',
        index: 0,
      },
      {
        label: t(`${I18N_PATH}TabWorkOrdersTitle`, {
          workOrdersCount: values.workOrders.length,
        }),
        key: 'workOrders',
        index: 1,
      },
    ];
  }, [t, values.workOrders.length]);

  const onCancel = async () => {
    resetForm();
    await dailyRoutesStore.disableEditMode(dailyRoutesStore.dailyRouteModalSettings.id);
    onClose();
  };

  const onTabChange = useCallback(
    async (tab: NavigationConfigItem<DailyRouteConfigType>) => {
      const errors = await validateForm();
      const isValid = Object.keys(errors).length === 0;

      // If user is in second tab (or second tab is invalid) and press first or form is valid (for 1st tab)
      if (currentTabIndex === 1 || isValid) {
        setCurrentTabIndex(tab.index as 0 | 1);
      }
    },
    [currentTabIndex, validateForm],
  );

  const onSubmit = useCallback(() => {
    if (isEdited) {
      return handleSubmit();
    }

    if (currentTabIndex === 0) {
      onTabChange(dailyRoutesTabsConfig[1]);
    } else {
      handleSubmit();
    }
  }, [handleSubmit, isEdited, currentTabIndex, dailyRoutesTabsConfig, onTabChange]);

  const headerTitle = useMemo(() => {
    return isEdited ? t(`${I18N_PATH}Edit`, { name: currentRoute?.name }) : t(`${I18N_PATH}New`);
  }, [isEdited, currentRoute?.name, t]);

  return (
    <>
      <Layouts.Box position="relative" ref={onAddRef}>
        <Layouts.Padding left="3" right="3">
          <QuickViewHeaderTitle
            name={headerTitle}
            color={currentRoute?.color}
            businessLineType={currentRoute?.businessLineType}
            showPreview={!!(isEdited && currentRoute)}
          >
            {headerTitle}
          </QuickViewHeaderTitle>
        </Layouts.Padding>
      </Layouts.Box>
      <Layouts.Scroll height={scrollContainerHeight}>
        <FormContainer formik={formik}>
          <Layouts.Padding left="3" right="3" bottom="3">
            <Navigation
              activeTab={dailyRoutesTabsConfig[currentTabIndex]}
              configs={dailyRoutesTabsConfig}
              onChange={onTabChange}
              border
              withEmpty
            />
            <Layouts.Padding top="2">
              <Component isEdited={isEdited} />
            </Layouts.Padding>
          </Layouts.Padding>
        </FormContainer>
      </Layouts.Scroll>
      <Layouts.Box position="relative" ref={onAddRef}>
        <Divider />
        <Layouts.Padding top="2" bottom="2" left="3" right="3">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={onCancel}>
              {t(`${I18N_ROOT_PATH}Cancel`)}
            </Button>
            <Button variant="primary" type="submit" onClick={onSubmit}>
              {isEdited
                ? t(`${I18N_ROOT_PATH}SaveChanges`)
                : currentTabIndex === 0
                ? t(`${I18N_PATH}NextStepButton`)
                : t(`${I18N_ROOT_PATH}SaveRoute`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </>
  );
};
