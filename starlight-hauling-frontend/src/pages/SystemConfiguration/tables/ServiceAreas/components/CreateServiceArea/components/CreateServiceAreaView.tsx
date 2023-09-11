import React, { useCallback, useMemo } from 'react';

import { UnsavedChangesModal } from '@root/common/TableTools/TableQuickView/UnsavedChanges/UnsavedChangesModal';
import { useBoolean } from '@root/hooks';

export interface ICreateServiceAreaView {
  confirmModalText: string;
  confirmModal: boolean;
  children(data: CreateServiceAreaChildren): React.ReactNode;
  onCancel?(showModal?: boolean): void;
  saveChanges?(): void;
}

type CreateServiceAreaChildren = {
  onCancel(showModal?: boolean): void;
};

export const CreateServiceAreaView: React.FC<ICreateServiceAreaView> = ({
  children,
  confirmModal,
  confirmModalText,
  onCancel,
  saveChanges,
}) => {
  const [isModalOpen, openModal, closeModal] = useBoolean();

  const handleCancel = useCallback(
    (showModal = true) => {
      if (showModal && confirmModal && !isModalOpen) {
        openModal();

        return;
      }
      if (isModalOpen) {
        closeModal();
      }
      onCancel?.();
    },
    [closeModal, confirmModal, isModalOpen, openModal, onCancel],
  );

  const handleSubmit = () => {
    saveChanges?.();
    closeModal();
  };

  const childrenProps = useMemo(() => {
    return {
      onCancel: handleCancel,
    };
  }, [handleCancel]);

  return (
    <>
      <UnsavedChangesModal
        text={confirmModalText}
        isOpen={confirmModal ? isModalOpen : false}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
      {children(childrenProps)}
    </>
  );
};
