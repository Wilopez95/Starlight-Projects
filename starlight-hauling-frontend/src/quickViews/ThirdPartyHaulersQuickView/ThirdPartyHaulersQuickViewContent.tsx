import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IThirdPartyHauler } from '@root/types';

import { getValues, validationSchema } from './formikData';
import ThirdPartyHaulersQuickViewActions from './ThirdPartyHaulersQuickViewActions';
import ThirdPartyHaulersQuickViewRightPanel from './ThirdPartyHaulersQuickViewRightPanel';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.ThirdPartyHaulers.QuickView.');

const ThirdPartyHaulersQuickViewContent: React.FC = () => {
  const { forceCloseQuickView } = useQuickViewContext();
  const { thirdPartyHaulerStore } = useStores();
  const { t } = useTranslation();
  const selectedThirdPartyHauler = thirdPartyHaulerStore.selectedEntity;

  const handleSubmit = useCallback(
    async (values: IThirdPartyHauler, formikHelpers: FormikHelpers<IThirdPartyHauler>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (values.id === 0) {
        await thirdPartyHaulerStore.create(values);
      } else {
        await thirdPartyHaulerStore.update(values);
      }

      forceCloseQuickView();
    },
    [forceCloseQuickView, thirdPartyHaulerStore],
  );

  const formik = useFormik({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(selectedThirdPartyHauler),
    onSubmit: handleSubmit,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<ThirdPartyHaulersQuickViewRightPanel />}
        actionsElement={<ThirdPartyHaulersQuickViewActions />}
      />
    </FormContainer>
  );
};

export default observer(ThirdPartyHaulersQuickViewContent);
