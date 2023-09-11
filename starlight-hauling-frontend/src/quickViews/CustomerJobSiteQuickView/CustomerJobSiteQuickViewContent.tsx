import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService, TaxExemptionService } from '@root/api';
import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { UnsavedChangesModal } from '@root/common/TableTools/TableQuickView/UnsavedChanges/UnsavedChangesModal';
import { FormContainer } from '@root/components';
import { JobSiteEditForm } from '@root/components/forms';
import {
  getTaxExemptionFormValue,
  sanitizeTaxExemptionValue,
} from '@root/components/forms/TaxExemption/formikData';
import { convertTaxExemptionDates } from '@root/components/forms/TaxExemption/helpers';
import { type FormikTaxExemption } from '@root/components/forms/TaxExemption/types';
import { ConfirmModal } from '@root/components/modals';
import { GeometryType } from '@root/consts';
import { convertDates, NotificationHelper } from '@root/helpers';
import { usePermission, useScrollOnError, useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import useTabConfirmModal from '@root/pages/SystemConfiguration/hooks/useTabConfirmModal';
import { type ICustomerJobSitePair, type ITaxExemption } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { CustomerJobSiteDetails, CustomerJobSiteExemptions } from './components';
import { generateValidationSchema, getValues } from './formikData';
import { CustomerJobSiteNavigationConfigItem, navigationConfig } from './navigationConfig';

const CustomerJobSiteQuickViewContent: React.FC = () => {
  const { forceCloseQuickView, closeQuickView } = useQuickViewContext();
  const { jobSiteStore, customerStore, projectStore, i18nStore } = useStores();
  const [customerJobSite, setCustomerJobSite] = useState<ICustomerJobSitePair>();
  const [customerJobSiteExemptions, setCustomerJobSiteExemptions] = useState<FormikTaxExemption>();
  const [customerExemptions, setCustomerExemptions] = useState<ITaxExemption>();
  const [currentJobSiteTab, setCurrentJobSiteTab] = useState<
    NavigationConfigItem<CustomerJobSiteNavigationConfigItem>
  >(navigationConfig[0]);
  const [exemptionsLoading, setExemptionsLoading] = useState(true);
  const intl = useIntl();
  const { t } = useTranslation();
  const [isConfirmModalOpen, toggleConfirmModalOpen] = useToggle();
  const disableGeofencing = useRef<boolean>(false);

  const jobSite = jobSiteStore.selectedEntity!;
  const customer = customerStore.selectedEntity!;

  const districtIds =
    customerJobSite?.taxDistricts
      ?.filter(district => district.active)
      ?.map(district => district.id) ?? [];

  const formik = useFormik({
    validationSchema: generateValidationSchema(currentJobSiteTab.key, intl, t),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues({
      information: {
        ...jobSite,
        geofence:
          jobSite.radius || jobSite.polygon
            ? {
                type: jobSite.radius ? GeometryType.radius : GeometryType.polygon,
                radius: jobSite.radius ?? undefined,
                coordinates: jobSite.polygon?.coordinates ?? undefined,
              }
            : null,
      },
      details: customerJobSite,
      taxExemptions: getTaxExemptionFormValue(districtIds, customerJobSiteExemptions),
    }),
    onSubmit: noop,
  });

  const { values, errors, isValidating, dirty, resetForm, validateForm } = formik;

  useScrollOnError(errors, !isValidating);

  const [isTabModalOpen, handleTabModalCancel, closeTabModal, handleTabChange] = useTabConfirmModal(
    dirty,
    setCurrentJobSiteTab as (tab: NavigationConfigItem) => void,
    resetForm,
  );

  const requestCustomerJobSite = useCallback(async () => {
    try {
      const linkedPairInfo = await GlobalService.getJobSiteCustomerPair(jobSite.id, customer.id);

      setCustomerJobSite(convertDates(linkedPairInfo));
    } catch {
      setCustomerJobSite(undefined);
    }
  }, [customer.id, jobSite.id]);

  const requestCustomerExemptions = useCallback(async () => {
    try {
      const customerExemptionsTax = await TaxExemptionService.getCustomerTaxExemptions(customer.id);

      setCustomerExemptions(convertDates(customerExemptionsTax));
    } catch {
      setCustomerExemptions(undefined);
    }
  }, [customer.id]);

  const requestCustomerJobSiteExemptions = useCallback(async () => {
    try {
      const customerJobSiteExemptionsTax =
        await TaxExemptionService.getCustomerJobSiteTaxExemptions(customer.id, jobSite.id);

      setCustomerJobSiteExemptions(convertTaxExemptionDates(customerJobSiteExemptionsTax));
    } catch {
      setCustomerJobSiteExemptions(undefined);
    }
  }, [customer.id, jobSite.id]);

  const canManageTaxExempts = usePermission('customers:tax-exempts:perform');

  const requestExemptions = useCallback(async () => {
    setExemptionsLoading(true);
    await Promise.all([requestCustomerExemptions(), requestCustomerJobSiteExemptions()]);
    setExemptionsLoading(false);
  }, [requestCustomerExemptions, requestCustomerJobSiteExemptions]);

  useEffect(() => {
    requestCustomerJobSite();
  }, [requestCustomerJobSite]);

  useEffect(() => {
    if (canManageTaxExempts) {
      requestExemptions();
    }
  }, [canManageTaxExempts, requestExemptions]);

  const updateTaxExemptions = useCallback(
    async (exemptions: FormikTaxExemption) => {
      try {
        await TaxExemptionService.updateCustomerJobSiteTaxExemptions(
          customer.id,
          jobSite.id,
          sanitizeTaxExemptionValue(exemptions),
        );

        NotificationHelper.success('update', 'Tax exemptions');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error(
          'update',
          typedError.response.code as ActionCode,
          'Tax exemptions',
        );
      }
    },
    [customer.id, jobSite.id],
  );

  const validate = useCallback(async () => {
    const formErrors = await validateForm();

    if (!isEmpty(formErrors)) {
      return false;
    }

    return true;
  }, [validateForm]);

  const handleSettingsSave = useCallback(async () => {
    const { key } = currentJobSiteTab;

    switch (key) {
      case 'information':
        await jobSiteStore.update(
          {
            ...values.information,
            geofence: disableGeofencing.current ? null : values.information.geofence,
            address: { ...values.information.address, region: i18nStore.region },
          },
          true,
        );
        requestCustomerJobSite();

        break;
      case 'details':
        if (values.details) {
          await jobSiteStore.updateLink({
            ...values.details,
            defaultPurchaseOrders: values.details.defaultPurchaseOrders?.length
              ? values.details.defaultPurchaseOrders
              : null,
          });
          requestCustomerJobSite();

          projectStore.requestAll({ customerJobSiteId: values.details.id });
        }
        break;
      case 'taxExemptions':
        if (values.taxExemptions) {
          await updateTaxExemptions(values.taxExemptions);
          requestExemptions();
        }
        break;
      default:
        return null;
    }

    return true;
  }, [
    currentJobSiteTab,
    i18nStore.region,
    jobSiteStore,
    projectStore,
    requestCustomerJobSite,
    requestExemptions,
    updateTaxExemptions,
    values.details,
    values.information,
    values.taxExemptions,
  ]);

  const handleTabModalSubmit = useCallback(async () => {
    const isValid = await validate();

    if (isValid) {
      await handleSettingsSave();
      handleTabModalCancel();
    } else {
      closeTabModal();
    }
  }, [closeTabModal, handleSettingsSave, handleTabModalCancel, validate]);

  const handleSubmit = useCallback(async () => {
    const isValid = await validate();

    if (!isValid) {
      return;
    }

    await handleSettingsSave();
    if (!jobSiteStore.isPreconditionFailed) {
      forceCloseQuickView();
    }
  }, [validate, handleSettingsSave, jobSiteStore.isPreconditionFailed, forceCloseQuickView]);

  const handleSubmitClick = useCallback(() => {
    if (
      values.information.showGeofencing &&
      !values.information.geofence?.radius &&
      !values.information.geofence?.coordinates
    ) {
      toggleConfirmModalOpen();
    } else {
      handleSubmit();
    }
  }, [
    handleSubmit,
    toggleConfirmModalOpen,
    values.information.geofence?.coordinates,
    values.information.geofence?.radius,
    values.information.showGeofencing,
  ]);

  const handleDisableGeofencing = useCallback(() => {
    disableGeofencing.current = true;
    handleSubmit();
  }, [handleSubmit]);

  const CurrentTab = useMemo(() => {
    switch (currentJobSiteTab.key) {
      case 'information':
        return <JobSiteEditForm basePath="information" />;
      case 'details':
        return <CustomerJobSiteDetails />;
      case 'taxExemptions':
        return (
          <CustomerJobSiteExemptions
            customerExemptions={customerExemptions}
            loading={exemptionsLoading}
          />
        );
      default:
        return null;
    }
  }, [currentJobSiteTab.key, customerExemptions, exemptionsLoading]);

  return (
    <>
      <UnsavedChangesModal
        isOpen={isTabModalOpen}
        onCancel={handleTabModalCancel}
        onSubmit={handleTabModalSubmit}
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Disable Geofencing"
        cancelButton="Keep Editing"
        submitButton="Disable Geofencing"
        subTitle="You enabled geofencing, but haven’t added one. Do you prefer to disable it or keep editing?"
        onCancel={toggleConfirmModalOpen}
        onSubmit={handleDisableGeofencing}
      />
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <>
            <Layouts.Padding padding="3">
              <div className={tableQuickViewStyles.quickViewTitle}>Custom Pair Settings</div>
            </Layouts.Padding>
            <Navigation
              configs={navigationConfig}
              border
              withEmpty
              activeTab={currentJobSiteTab}
              onChange={handleTabChange}
            />

            <Layouts.Scroll>
              <Layouts.Padding as={Layouts.Box} height="100%" padding="3">
                <FormContainer formik={formik} fullHeight>
                  {CurrentTab}
                </FormContainer>
              </Layouts.Padding>
            </Layouts.Scroll>
          </>
        }
        actionsElement={
          <ButtonContainer
            submitButtonType="button"
            onCancel={closeQuickView}
            onSave={handleSubmitClick}
          />
        }
      />
    </>
  );
};

export default observer(CustomerJobSiteQuickViewContent);
