import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { ICustomerGroup } from '@root/types';

import CustomerGroupActions from './CustomerGroupActions';
import CustomerGroupRightPanel from './CustomerGroupRightPanel';
import { getValues, validationSchema } from './formikData';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.CustomerGroups.QuickView.');

const CustomerGroupContent: React.FC = () => {
  const { customerGroupStore } = useStores();
  const { forceCloseQuickView } = useQuickViewContext();
  const { t } = useTranslation();

  const selectedCustomerGroup = customerGroupStore.selectedEntity;

  const handleCustomerGroupChange = useCallback(
    async (values: ICustomerGroup, formikHelpers: FormikHelpers<ICustomerGroup>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }
      if (values.id === 0) {
        await customerGroupStore.create(values);
      } else {
        await customerGroupStore.update(values);
      }
      forceCloseQuickView();
    },
    [customerGroupStore, forceCloseQuickView],
  );

  const formik = useFormik<ICustomerGroup>({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors),
    validateOnChange: false,
    enableReinitialize: true,
    initialErrors: {},
    initialValues: getValues(selectedCustomerGroup),
    onSubmit: handleCustomerGroupChange,
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<CustomerGroupRightPanel />}
        actionsElement={<CustomerGroupActions />}
      />
    </FormContainer>
  );
};

export default observer(CustomerGroupContent);
