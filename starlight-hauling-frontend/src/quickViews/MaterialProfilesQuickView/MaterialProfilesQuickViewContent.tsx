import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { buildI18Path } from '@root/i18n/helpers';
import { IMaterialProfile } from '@root/types';
import { useBusinessContext, useScrollOnError, useStores } from '@hooks';

import { getValues, validationSchema } from './formikData';
import MaterialProfilesQuickViewActions from './MaterialProfilesQuickViewActions';
import { MaterialProfilesQuickViewRightPanel } from './MaterialProfilesQuickViewRightPanel';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.MaterialProfiles.QuickView.MaterialProfilesQuickView.',
);

const MaterialProfilesQuickViewContent: React.FC = () => {
  const { t } = useTranslation();
  const { materialProfileStore, systemConfigurationStore } = useStores();
  const { forceCloseQuickView } = useQuickViewContext();
  const { businessLineId } = useBusinessContext();

  const selectedMaterialProfile = materialProfileStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedMaterialProfile;
  const [isLoading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (values: IMaterialProfile, formikHelpers: FormikHelpers<IMaterialProfile>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      setLoading(true);

      if (values.id === 0) {
        materialProfileStore.create(values);
      } else {
        await materialProfileStore.update(values);
      }
      if (!materialProfileStore.isPreconditionFailed) {
        forceCloseQuickView();
      }

      setLoading(false);
    },
    [materialProfileStore, forceCloseQuickView],
  );

  const formik = useFormik({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors, isNew),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(businessLineId, selectedMaterialProfile),
    onSubmit: handleSubmit,
  });

  const { errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<MaterialProfilesQuickViewRightPanel />}
        actionsElement={<MaterialProfilesQuickViewActions isLoading={isLoading} />}
      />
    </FormContainer>
  );
};

export default observer(MaterialProfilesQuickViewContent);
