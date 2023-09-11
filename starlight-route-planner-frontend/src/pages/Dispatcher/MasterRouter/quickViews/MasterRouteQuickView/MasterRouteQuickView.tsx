import React, { useCallback, useMemo, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormContainer,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Typography,
} from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { ICreateMasterRouteParams, IUpdateMasterRouteParams } from '@root/api/masterRoutes/types';
import { ServiceDays } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';
import { QuickView, QuickViewHeaderTitle } from '@root/quickViews';

import { useMasterRouteActionsContext } from '../../common/MasterRouteActions/MasterRouteActions';

import { DetailsForm, DetailsValidationSchema as detailsValidationSchema } from './DetailsForm';
import { getInitialValues } from './formikData';
import { normalizeServiceItems } from './normalize';
import { ServicesForm, ServicesValidationSchema as servicesValidationSchema } from './ServicesForm';
import {
  IForm,
  IMasterRouteCustomizedFormValues,
  IMasterRouteQuickView,
  MasterRouteConfigType,
} from './types';

const I18N_ROOT_PATH = 'Text.';
const I18N_PATH = 'quickViews.MasterRouteView.Text.';

const Form: React.FC<IForm> = ({ onAddRef, scrollContainerHeight, onClose }) => {
  const { masterRoutesStore } = useStores();
  const { id, activeTabIndex } = masterRoutesStore.masterRouteModalSettings;
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const masterRouteActions = useMasterRouteActionsContext();

  const [currentTabIndex, setCurrentTabIndex] = useState<0 | 1>(activeTabIndex ?? 0);

  const isEdited = useMemo(() => !!id, [id]);

  const tabs = [
    {
      Component: DetailsForm,
      validationSchema: detailsValidationSchema(t, isEdited),
      validateOnChange: false,
    },
    {
      Component: ServicesForm,
      validationSchema: servicesValidationSchema(t),
      validateOnChange: true,
    },
  ];

  const onFormSubmit = useCallback(
    async (
      formData: IMasterRouteCustomizedFormValues,
      { setFieldError }: FormikHelpers<IMasterRouteCustomizedFormValues>,
    ) => {
      if (masterRoutesStore.masterRouteModalSettings.id) {
        await masterRouteActions.checkIfCanUpdate(masterRoutesStore.masterRouteModalSettings.id);
      }

      const normalizedFormData = normalizeServiceItems(formData, isEdited);

      let result;

      if (isEdited) {
        const data = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: masterRoutesStore.masterRouteModalSettings.id!,
          ...normalizedFormData,
        } as IUpdateMasterRouteParams;

        result = await masterRoutesStore.updateMasterRoute(data);
      } else {
        const data = {
          businessUnitId,
          ...normalizedFormData,
        } as ICreateMasterRouteParams;

        result = await masterRoutesStore.createMasterRoute(data);
      }

      if (result) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await onTabChange(masterRouteTabsConfig[0]);
        setFieldError('name', t(`${I18N_ROOT_PATH}RouteNameExists`, { name: formData.name }));

        return;
      }

      onClose(masterRoutesStore.masterRouteModalSettings.id);
    },
    [businessUnitId, masterRoutesStore, isEdited, onClose, t],
  );

  const currentRoute = masterRoutesStore.getMasterRouteByModalSettings;

  const { Component, ...rest } = tabs[currentTabIndex];

  const formik = useFormik({
    initialValues: getInitialValues(currentRoute),
    onSubmit: onFormSubmit,
    enableReinitialize: true,
    ...rest,
  });

  const { errors, resetForm, handleSubmit, validateForm } = formik;

  const masterRouteTabsConfig: NavigationConfigItem<MasterRouteConfigType>[] = useMemo(() => {
    return [
      {
        label: t(`${I18N_PATH}TabDetailsTitle`),
        key: 'details',
        index: 0,
      },
      {
        label: t(`${I18N_PATH}TabServicesTitle`, {
          servicesCount: formik.values.serviceItems.length,
        }),
        key: 'services',
        index: 1,
      },
    ];
  }, [t, formik.values.serviceItems.length]);

  const onCancel = async () => {
    resetForm();
    await masterRoutesStore.disableEditMode(masterRoutesStore.masterRouteModalSettings.id);
    onClose();
  };

  const onTabChange = useCallback(
    async (tab: NavigationConfigItem<MasterRouteConfigType>) => {
      const tapChangeErrors = await validateForm();
      const isValid = Object.keys(tapChangeErrors).length === 0;

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
      onTabChange(masterRouteTabsConfig[1]);
    } else {
      handleSubmit();
    }
  }, [handleSubmit, currentTabIndex, isEdited, onTabChange, masterRouteTabsConfig]);

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
          <Layouts.Margin bottom="2" top="2">
            <Divider />
          </Layouts.Margin>
        </Layouts.Padding>
      </Layouts.Box>
      <Layouts.Scroll height={scrollContainerHeight}>
        <FormContainer formik={formik}>
          <Layouts.Padding left="3" right="3" bottom="3">
            <ServiceDays
              name="serviceDaysList"
              title={t(`${I18N_PATH}ServiceDaysTitle`)}
              error={errors.serviceDaysList as string}
              disabled={isEdited}
            />
            {errors.serviceDaysList ? (
              <Layouts.Padding top="1">
                <Typography color="alert" variant="bodySmall">
                  {errors.serviceDaysList}
                </Typography>
              </Layouts.Padding>
            ) : null}
            <Navigation
              activeTab={masterRouteTabsConfig[currentTabIndex]}
              configs={masterRouteTabsConfig}
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
            <Button variant="primary" onClick={onSubmit}>
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

const MasterRouteQuickView: React.FC<IMasterRouteQuickView> = ({ mainContainerRef, onClose }) => {
  const { masterRoutesStore } = useStores();

  const disableEditMode = () =>
    masterRoutesStore.disableEditMode(masterRoutesStore.masterRouteModalSettings.id);

  const onClickOutHandler = async () => {
    await disableEditMode();
    onClose();
  };

  useBeforeunload(() => {
    disableEditMode();
  });

  return (
    <QuickView
      condition={!!masterRoutesStore.masterRouteModalSettings.visible}
      clickOutHandler={onClickOutHandler}
      parentRef={mainContainerRef}
      clickOutSelectors={['#master-router-map']}
      id="master-route-quick-view"
    >
      {({ onAddRef, scrollContainerHeight }) => (
        <Form scrollContainerHeight={scrollContainerHeight} onClose={onClose} onAddRef={onAddRef} />
      )}
    </QuickView>
  );
};

export default observer(MasterRouteQuickView);
