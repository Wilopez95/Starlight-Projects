import React, { useCallback } from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { ConfirmModal } from '@root/components/modals';
import { useBoolean, useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';
import { IPromo } from '@root/types';

import { IPromosQuickViewData } from './types';

const PromosQuickViewActions: React.FC<IPromosQuickViewData> = ({ isLoading }) => {
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useBoolean();
  const [_, canUpdatePromos] = useCrudPermissions('configuration', 'promos');

  const { promoStore, systemConfigurationStore } = useStores();
  const { values, handleSubmit } = useFormikContext<IPromo>();
  const { forceCloseQuickView, closeQuickView } = useQuickViewContext();

  const selectedPromo = promoStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedPromo;

  const handleDelete = useCallback(async () => {
    await promoStore.delete(values.id);
    closeDeleteModal();
    forceCloseQuickView();
  }, [closeDeleteModal, promoStore, forceCloseQuickView, values.id]);

  return (
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        cancelButton="Cancel"
        submitButton="Delete Promo"
        title="Delete Promo"
        subTitle="Are you sure you want to delete this promo?"
        onCancel={closeDeleteModal}
        onSubmit={handleDelete}
      />
      {canUpdatePromos ? (
        <ButtonContainer
          isCreating={isNew}
          onSave={() => handleSubmit()}
          onCancel={closeQuickView}
          onDelete={selectedPromo?.active ? undefined : openDeleteModal}
          disabled={isLoading}
        />
      ) : null}
    </>
  );
};

export default observer(PromosQuickViewActions);
