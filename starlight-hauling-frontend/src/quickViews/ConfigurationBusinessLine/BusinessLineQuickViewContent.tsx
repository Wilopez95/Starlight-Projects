import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { IBusinessLine } from '@root/types';

import { BusinessLineQuickViewActions } from './BusinessLineQuickViewActions';
import BusinessLineQuickViewRightPanel from './BusinessLineQuickViewRightPanel';
import { generateValidationSchema, getValues } from './formikData';

const I18N_BASE = 'pages.SystemConfiguration.tables.BusinessLines.QuickView.';

const I18N_BASE_FORM_VALIDATORS = `${I18N_BASE}ValidationErrors.`;

const BusinessLineQuickViewContent: React.FC = () => {
  const { businessLineStore } = useStores();
  const { forceCloseQuickView } = useQuickViewContext();
  const selectedBusinessLine = businessLineStore.selectedEntity;
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    async (values: IBusinessLine, formikHelpers: FormikHelpers<IBusinessLine>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      await businessLineStore[selectedBusinessLine ? 'update' : 'create'](values);

      forceCloseQuickView();
    },
    [businessLineStore, selectedBusinessLine, forceCloseQuickView],
  );

  const formik = useFormik({
    validationSchema: generateValidationSchema(businessLineStore, t, I18N_BASE_FORM_VALIDATORS),
    enableReinitialize: true,
    initialValues: getValues(selectedBusinessLine),
    initialErrors: {},
    validateOnChange: false,
    onSubmit: handleSubmit,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  const isNew = !selectedBusinessLine;

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={<BusinessLineQuickViewRightPanel isNew={isNew} />}
        actionsElement={<BusinessLineQuickViewActions isNew={isNew} />}
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(BusinessLineQuickViewContent);
