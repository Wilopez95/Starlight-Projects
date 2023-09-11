import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer } from '@root/components';
import { JobSiteEditForm } from '@root/components/forms';
import { ConfirmModal } from '@root/components/modals';
import { addressFormatShort } from '@root/helpers';
import { useCrudPermissions, useScrollOnError, useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
//TODO move this to @root/components
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

import { generateValidationSchema, getValues } from './formikData';
import { JobSiteNavigationConfigItem, navigationConfig } from './navigationConfig';
import TaxDistrictsList from './TaxDistrictsList';

const JobSiteQuickViewContent: React.FC = () => {
  const { closeQuickView } = useQuickViewContext();
  const { jobSiteStore, taxDistrictStore, i18nStore } = useStores();
  const [currentJobSiteTab, setCurrentJobSiteTab] = useState<
    NavigationConfigItem<JobSiteNavigationConfigItem>
  >(navigationConfig[0]);
  const intl = useIntl();

  const jobSite = jobSiteStore.selectedEntity!;

  const formik = useFormik({
    validationSchema: generateValidationSchema(intl),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(jobSite),
    onSubmit: noop,
  });

  const { values, errors, isValidating, validateForm } = formik;
  const [isConfirmModalOpen, toggleConfirmModalOpen] = useToggle();
  const disableGeofencing = useRef<boolean>(false);

  useEffect(() => {
    jobSiteStore.requestById(jobSite.id, { includeInactiveTaxDistricts: true });
    taxDistrictStore.request();
  }, [taxDistrictStore, jobSiteStore, jobSite.id]);

  useScrollOnError(errors, !isValidating);

  const handleSubmit = useCallback(async () => {
    const formErrors = await validateForm();

    if (!isEmpty(formErrors)) {
      return;
    }

    await jobSiteStore.updateWithTaxDistricts(
      {
        ...values.jobSite,
        address: { ...values.jobSite.address, region: i18nStore.region },
        geofence: disableGeofencing.current ? null : values.jobSite.geofence,
      },
      values.taxDistrictIds,
    );

    if (!jobSiteStore.isPreconditionFailed) {
      closeQuickView();
    }
  }, [
    closeQuickView,
    i18nStore.region,
    jobSiteStore,
    validateForm,
    values.jobSite,
    values.taxDistrictIds,
  ]);

  const handleSubmitClick = useCallback(() => {
    if (
      values.jobSite.showGeofencing &&
      !values.jobSite.geofence?.radius &&
      !values.jobSite.geofence?.coordinates
    ) {
      toggleConfirmModalOpen();
    } else {
      handleSubmit();
    }
  }, [
    handleSubmit,
    toggleConfirmModalOpen,
    values.jobSite.geofence?.coordinates,
    values.jobSite.geofence?.radius,
    values.jobSite.showGeofencing,
  ]);

  const handleDisableGeofencing = useCallback(() => {
    disableGeofencing.current = true;
    handleSubmit();
  }, [handleSubmit]);

  const [canViewTaxDistricts] = useCrudPermissions('configuration', 'tax-districts');

  let currentTab: React.ReactElement;

  if (currentJobSiteTab.key === 'jobSite') {
    currentTab = <JobSiteEditForm basePath="jobSite" />;
  } else {
    currentTab = <TaxDistrictsList />;
  }

  const { address } = jobSite;

  return (
    <>
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
            <div className={tableQuickViewStyles.header}>
              <div className={tableQuickViewStyles.dataContainer}>
                <div className={tableQuickViewStyles.quickViewTitle}>
                  {addressFormatShort(address)}
                </div>
                <div className={tableQuickViewStyles.quickViewDescription}>
                  {address.city}, {address.state}
                </div>
              </div>
              <Navigation
                configs={navigationConfig}
                border
                withEmpty
                activeTab={currentJobSiteTab}
                onChange={setCurrentJobSiteTab}
              />
            </div>
            <Layouts.Scroll>
              <Layouts.Padding as={Layouts.Box} padding="3" height="100%">
                <FormContainer formik={formik} fullHeight>
                  {currentTab}
                </FormContainer>
              </Layouts.Padding>
            </Layouts.Scroll>
          </>
        }
        actionsElement={
          <ButtonContainer
            submitButtonType="button"
            onCancel={closeQuickView}
            onSave={
              !canViewTaxDistricts && currentJobSiteTab.key === 'taxDistricts'
                ? undefined
                : handleSubmitClick
            }
          />
        }
      />
    </>
  );
};

export default observer(JobSiteQuickViewContent);
