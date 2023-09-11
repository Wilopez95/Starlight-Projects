import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { IDriverFormikData } from '@root/types';

import DriverQuickViewActions from './DriverQuickViewActions';
import DriverQuickViewRightPanel from './DriverQuickViewRightPanel';
import { generateValidationSchema, getValues } from './formikData';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.Driver.');

const DriverQuickViewContent: React.FC = () => {
  const { driverStore, systemConfigurationStore, businessUnitStore, truckStore } = useStores();
  const { validatePhoneNumber } = useIntl();
  const { forceCloseQuickView } = useQuickViewContext();
  const { t } = useTranslation();

  const selectedDriver = driverStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = !selectedDriver || isCreating;

  useEffect(() => {
    businessUnitStore.cleanup();
    truckStore.cleanup();
    businessUnitStore.request();

    if (selectedDriver?.id) {
      driverStore.requestById(selectedDriver.id, true);
    }
  }, [truckStore, driverStore, businessUnitStore, selectedDriver?.id]);

  useEffect(() => {
    if (selectedDriver) {
      truckStore.requestAll({
        activeOnly: true,
        filterByBusinessUnit: selectedDriver.businessUnitIds,
      });
    }
  }, [selectedDriver, truckStore]);

  const handleSubmit = useCallback(
    async (values: IDriverFormikData, formikHelpers: FormikHelpers<IDriverFormikData>) => {
      const errors = await formikHelpers.validateForm();

      if (!isEmpty(errors)) {
        return;
      }

      if (isNew) {
        await driverStore.create(values);
      } else if (selectedDriver?.id) {
        await driverStore.update(values);
      }
      driverStore.cleanup();
      forceCloseQuickView();
    },
    [isNew, selectedDriver?.id, forceCloseQuickView, driverStore],
  );

  const formik = useFormik<IDriverFormikData>({
    validationSchema: generateValidationSchema(t, I18N_PATH.ValidationErrors, validatePhoneNumber),
    enableReinitialize: true,
    initialValues: getValues(selectedDriver, isNew),
    initialErrors: {},
    onSubmit: handleSubmit,
    validateOnChange: false,
  });

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<DriverQuickViewRightPanel />}
        actionsElement={<DriverQuickViewActions />}
      />
    </FormContainer>
  );
};

export default observer(DriverQuickViewContent);
