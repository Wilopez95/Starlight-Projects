import React, { useCallback } from 'react';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';

import QbIntegrationQuickViewActions from './QbIntegrationQuickViewActions';
import QbIntegrationQuickViewRightPanel from './QbIntegrationQuickViewRightPanel';
import { QbIntegrationFormikData, getValues, validationSchema } from './formikData';

const QbIntegrationQuickViewContent: React.FC = () => {
  const { qbIntegrationSettingsStore } = useStores();
  const { forceCloseQuickView } = useQuickViewContext();

  const selectedDomain = qbIntegrationSettingsStore.selectedEntity;

  const handleSubmit = useCallback(async () => {
    forceCloseQuickView();
    qbIntegrationSettingsStore.request();
  }, [qbIntegrationSettingsStore, forceCloseQuickView]);

  const formik = useFormik<QbIntegrationFormikData>({
    validationSchema,
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: getValues(selectedDomain),
    onSubmit: handleSubmit,
  });

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={<QbIntegrationQuickViewRightPanel />}
        actionsElement={<QbIntegrationQuickViewActions />}
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(QbIntegrationQuickViewContent);
