import React, { useCallback } from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { useBoolean, useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

import { IRoleQuickViewData } from './types';

const RoleButtonContainer: React.FC<IRoleQuickViewData> = ({ isNew }) => {
  const { systemConfigurationStore, roleStore } = useStores();

  const { closeQuickView, onDuplicate, forceCloseQuickView } = useQuickViewContext();
  const { handleSubmit, isSubmitting } = useFormikContext();
  // one permission for both users & roles
  const [_, canModifyRoles] = useCrudPermissions('configuration', 'users');

  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useBoolean();

  const isDuplicating = systemConfigurationStore.isDuplicating;

  const selectedRole = roleStore.selectedEntity;

  const handleDelete = useCallback(() => {
    if (selectedRole) {
      roleStore.delete(String(selectedRole.id));
      closeDeleteModal();
      forceCloseQuickView();
    }
  }, [closeDeleteModal, forceCloseQuickView, roleStore, selectedRole]);

  return (
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        cancelButton="Cancel"
        submitButton="Delete"
        title="Delete Role"
        subTitle="Are you sure you want to delete this role?"
        onCancel={closeDeleteModal}
        onSubmit={handleDelete}
      />

      {canModifyRoles ? (
        <ButtonContainer
          isCreating={isNew}
          isDuplicating={isDuplicating}
          onSave={() => handleSubmit()}
          onCancel={closeQuickView}
          onDelete={openDeleteModal}
          onDuplicate={onDuplicate}
          disabled={isSubmitting}
        />
      ) : null}
    </>
  );
};

export default observer(RoleButtonContainer);
