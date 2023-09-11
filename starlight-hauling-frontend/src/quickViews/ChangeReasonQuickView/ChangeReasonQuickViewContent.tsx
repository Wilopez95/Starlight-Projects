import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';

import ChangeReasonQuickViewActions from './ChangeReasonQuickViewActions';
import ChangeReasonQuickViewRightPanel from './ChangeReasonQuickViewRightPanel';
import { generateValidationSchema, getValues } from './formikData';
import { IChangeReasonFormData } from './types';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.ChangeReasons.QuickView.ChangeReason.',
);

const ChangeReasonQuickViewContent: React.FC = () => {
  const { changeReasonStore } = useStores();
  const { t } = useTranslation();
  const { forceCloseQuickView } = useQuickViewContext();

  const selectedChangeReason = changeReasonStore.selectedEntity;

  const handleSubmit = useCallback(
    async (values: IChangeReasonFormData, formikHelpers: FormikHelpers<IChangeReasonFormData>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (selectedChangeReason) {
        await changeReasonStore.update(values);
      } else {
        await changeReasonStore.create(values);
      }
      changeReasonStore.cleanup();
      forceCloseQuickView();
    },
    [selectedChangeReason, forceCloseQuickView, changeReasonStore],
  );

  const formik = useFormik({
    initialValues: getValues(selectedChangeReason),
    validationSchema: generateValidationSchema(changeReasonStore, t, I18N_PATH.ValidationErrors),
    enableReinitialize: true,
    initialErrors: {},
    onSubmit: handleSubmit,
    validateOnChange: false,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={<ChangeReasonQuickViewRightPanel />}
        actionsElement={<ChangeReasonQuickViewActions />}
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(ChangeReasonQuickViewContent);
