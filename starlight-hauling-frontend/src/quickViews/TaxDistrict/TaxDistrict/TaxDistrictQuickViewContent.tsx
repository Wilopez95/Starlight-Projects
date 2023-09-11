import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';

import { generateValidationSchema, getValues } from './formikData';
import TaxDistrictQuickViewActions from './TaxDistrictQuickViewActions';
import TaxDistrictQuickViewRightPanel from './TaxDistrictQuickViewRightPanel';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.TaxDistricts.QuickView.TaxDistrict.',
);

const TaxDistrictQuickViewContent: React.FC = () => {
  const { taxDistrictStore } = useStores();

  const selectedTaxDistrict = taxDistrictStore.selectedEntity;

  const { t } = useTranslation();

  const formik = useFormik({
    validationSchema: generateValidationSchema(taxDistrictStore, t, I18N_PATH.ValidationErrors),
    enableReinitialize: true,
    initialValues: getValues(selectedTaxDistrict),
    initialErrors: {},
    onSubmit: noop,
    validateOnChange: false,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<TaxDistrictQuickViewRightPanel />}
        actionsElement={<TaxDistrictQuickViewActions />}
      />
    </FormContainer>
  );
};

export default observer(TaxDistrictQuickViewContent);
