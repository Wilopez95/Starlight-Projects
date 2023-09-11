import React from 'react';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';
import { QuickViewContent } from '@root/common';
import { FormContainer } from '@root/components';
import { useStores } from '@root/hooks';

import QbIntegrationLogQuickViewActions from './QbIntegrationLogQuickViewActions';
import QbIntegrationLogQuickViewRightPanel from './QbIntegrationLogQuickViewRightPanel';
import { QbIntegrationLogFormikData, getValues, validationSchema } from './formikData';

const QbIntegrationLogQuickViewContent: React.FC = () => {
  const { qbIntegrationLogStore } = useStores();
  const selectedDomain = qbIntegrationLogStore.selectedEntity;

  const formik = useFormik<QbIntegrationLogFormikData>({
    validationSchema,
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: getValues(selectedDomain),
    onSubmit: () => {},
  });

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={<QbIntegrationLogQuickViewRightPanel />}
        actionsElement={<QbIntegrationLogQuickViewActions />}
      />
    </FormContainer>
  );
};

export default observer(QbIntegrationLogQuickViewContent);
