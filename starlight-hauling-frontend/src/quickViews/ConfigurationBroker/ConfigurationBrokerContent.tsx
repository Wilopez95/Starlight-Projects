import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';

import { QuickViewConfirmModal, QuickViewContent, useQuickViewContext } from '@root/common';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { IBroker } from '@root/types';

import ConfigurationBrokerActions from './ConfigurationBrokerActions';
import ConfigurationBrokerRightPanel from './ConfigurationBrokerRightPanel';
import { getValues, validationSchema } from './formikData';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.Brokers.QuickView.');

const ConfigurationBrokerContent: React.FC = () => {
  const { brokerStore } = useStores();
  const { forceCloseQuickView } = useQuickViewContext();

  const selectedBroker = brokerStore.selectedEntity;

  const { t } = useTranslation();

  const handleBrokerChange = useCallback(
    async (values: IBroker, formikHelpers: FormikHelpers<IBroker>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (selectedBroker) {
        await brokerStore.update(values);
      } else {
        if (brokerStore.values.find(broker => broker.email === values.email)) {
          formikHelpers.setFieldError('email', t(`${I18N_PATH.Text}BrokerExists`));

          return;
        }
        await brokerStore.create(values);
      }
      forceCloseQuickView();
    },
    [selectedBroker, forceCloseQuickView, brokerStore, t],
  );

  const formik = useFormik({
    validationSchema: validationSchema(t, I18N_PATH.ValidationErrors),
    enableReinitialize: true,
    initialValues: getValues(selectedBroker),
    validateOnChange: false,
    onSubmit: handleBrokerChange,
    initialErrors: {},
  });

  useScrollOnError(formik.errors, !formik.isValidating);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={<ConfigurationBrokerRightPanel />}
        actionsElement={<ConfigurationBrokerActions />}
      />
    </FormContainer>
  );
};

export default ConfigurationBrokerContent;
