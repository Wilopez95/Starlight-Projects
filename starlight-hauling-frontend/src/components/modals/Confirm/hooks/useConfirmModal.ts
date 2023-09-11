import { useBoolean, usePrevious } from '@hooks';

export const useConfirmModal = () => {
  const [isModalOpen, openModal, closeModal] = useBoolean();
  const [isConfirmed, confirm, unConfirm] = useBoolean();
  const prevIsConfirmed = usePrevious(isConfirmed);

  return {
    isModalOpen,
    openModal,
    closeModal,
    isConfirmed,
    prevIsConfirmed,
    confirm: () => {
      confirm();
      closeModal();
    },
    unConfirm: () => {
      unConfirm();
      closeModal();
    },
  };
};
