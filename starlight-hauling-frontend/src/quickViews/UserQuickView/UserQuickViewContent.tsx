import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  QuickViewConfirmModal,
  QuickViewContent,
  useQuickViewContext,
} from '@root/common/QuickView';
import { FormContainer } from '@root/components';
import { useScrollOnError, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { usersNavigationConfig } from './config';
import { FormUser, getValues, validationSchema } from './formikData';
import ButtonContainer from './UserQuickViewButtonContainer';
import { UserQuickViewRightPanel } from './UserQuickViewRightPanel';

const UserQuickView: React.FC = () => {
  const { systemConfigurationStore, userStore } = useStores();
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(usersNavigationConfig[0]);

  const { t } = useTranslation();
  const intl = useIntl();
  const { forceCloseQuickView } = useQuickViewContext();

  const selectedUser = userStore.selectedEntity;
  const { isCreating } = systemConfigurationStore;
  const isNew = !selectedUser || isCreating;

  const handleSubmit = useCallback(
    async (values: FormUser, formikHelpers: FormikHelpers<FormUser>) => {
      const formErrors = await formikHelpers.validateForm();

      if (!isEmpty(formErrors) && activeTab.key === 'general') {
        return;
      }
      setLoading(true);
      if (selectedUser?.id) {
        // TODO: remove string conversion once we stop using number IDs.
        await userStore.update(String(selectedUser.id), values);
      } else {
        await userStore.create(values);
      }
      setLoading(false);

      forceCloseQuickView();
    },
    [activeTab, forceCloseQuickView, selectedUser?.id, userStore],
  );

  const formik = useFormik({
    validationSchema: validationSchema(userStore, activeTab?.key, intl, t),
    enableReinitialize: true,
    // initialValues: getValues(selectedUser, resourceStore.values),
    // See comment in formikData regarding REC-2419
    // Steven, 11/17/2022
    initialValues: getValues(selectedUser),
    initialErrors: {},
    onSubmit: handleSubmit,
    validateOnChange: false,
  });

  const { errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    if (selectedUser?.id) {
      userStore.requestById(String(selectedUser.id));
    }
  }, [selectedUser?.id, userStore]);

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        rightPanelElement={
          <UserQuickViewRightPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isNew={isNew}
            isLoading={isLoading}
          />
        }
        actionsElement={<ButtonContainer isNew={isNew} isLoading={isLoading} />}
      />
    </FormContainer>
  );
};

export default observer(UserQuickView);
