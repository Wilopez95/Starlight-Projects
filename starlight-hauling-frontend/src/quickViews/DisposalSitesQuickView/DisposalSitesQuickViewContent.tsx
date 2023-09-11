import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { useIntl } from '@root/i18n/useIntl';

import DisposalSitesQuickViewActions from './DisposalSitesQuickViewActions';
import DisposalSitesQuickViewRightPanel from './DisposalSitesQuickViewRightPanel';
import { generateValidationSchema, getValues, IDisposalSiteFormData } from './formikData';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.DisposalSites.QuickView.');

const DisposalSitesQuickViewContent: React.FC = () => {
  const { disposalSiteStore, i18nStore } = useStores();
  const { t } = useTranslation();
  const { forceCloseQuickView } = useQuickViewContext();
  const intl = useIntl();

  const selectedDisposalSite = disposalSiteStore.selectedEntity;

  const handleDisposalSiteChange = useCallback(
    async (values: IDisposalSiteFormData, formikHelpers: FormikHelpers<IDisposalSiteFormData>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (selectedDisposalSite) {
        await disposalSiteStore.update({
          ...values,
          address: { ...values.address, region: i18nStore.region },
        });
      } else {
        if (disposalSiteStore.selectedEntity?.description === values.description) {
          return formikHelpers.setFieldError(
            'description',
            t(`${I18N_PATH.ValidationErrors}DescriptionMustBeUnique`),
          );
        }
        disposalSiteStore.create(values);
      }
      if (!disposalSiteStore.isPreconditionFailed) {
        forceCloseQuickView();
      }
    },
    [selectedDisposalSite, disposalSiteStore, i18nStore.region, t, forceCloseQuickView],
  );

  const formik = useFormik({
    validationSchema: generateValidationSchema(
      disposalSiteStore,
      t,
      I18N_PATH.ValidationErrors,
      intl,
    ),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(selectedDisposalSite, ''),
    onSubmit: handleDisposalSiteChange,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        rightPanelElement={<DisposalSitesQuickViewRightPanel />}
        actionsElement={<DisposalSitesQuickViewActions />}
        confirmModal={<QuickViewConfirmModal />}
      />
    </FormContainer>
  );
};

export default observer(DisposalSitesQuickViewContent);
