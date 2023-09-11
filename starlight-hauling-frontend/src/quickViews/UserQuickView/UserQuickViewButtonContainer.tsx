import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { useBoolean, useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

import { IUserQuickViewData } from './types';

const I18N_PATH = `pages.SystemConfiguration.tables.UsersAndRoles.components.User.QuickView.Text.`;

const UserQuickViewButtonContainer: React.FC<IUserQuickViewData> = ({ isLoading }) => {
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useBoolean();
  const { userStore, systemConfigurationStore } = useStores();
  const [_, canModifyUsers] = useCrudPermissions('configuration', 'users');
  const { handleSubmit } = useFormikContext();
  const { forceCloseQuickView, closeQuickView } = useQuickViewContext();

  const { t } = useTranslation();

  const selectedUser = userStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedUser;

  const handleDelete = useCallback(() => {
    userStore.delete(String(selectedUser!.id));
    closeDeleteModal();
    forceCloseQuickView();
  }, [userStore, selectedUser, closeDeleteModal, forceCloseQuickView]);

  return (
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        cancelButton={t('Text.Cancel')}
        submitButton={t('Text.Delete')}
        title={t(`${I18N_PATH}DeleteUser`)}
        subTitle={t(`${I18N_PATH}AreYouSure`)}
        onCancel={closeDeleteModal}
        onSubmit={handleDelete}
      />
      {canModifyUsers ? (
        <ButtonContainer
          isCreating={isNew}
          onSave={() => handleSubmit()}
          onCancel={closeQuickView}
          onDelete={openDeleteModal}
          disabled={isLoading}
        />
      ) : null}
    </>
  );
};

export default observer(UserQuickViewButtonContainer);
