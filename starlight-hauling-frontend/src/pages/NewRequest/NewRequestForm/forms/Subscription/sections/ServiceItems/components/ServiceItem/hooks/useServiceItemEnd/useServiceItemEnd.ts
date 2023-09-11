import { useCallback, useEffect } from 'react';

import { useConfirmModal } from '@root/components/modals';
import { isScheduledService } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/helpers/isScheduledService';
import { INewSubscriptionService } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const useServiceItemEnd = ({
  serviceItem,
  updateServiceItemQuantity,
}: {
  serviceItem: INewSubscriptionService;
  updateServiceItemQuantity(newQuantity: number): void;
}) => {
  const { isConfirmed, prevIsConfirmed, confirm, isModalOpen, openModal, closeModal } =
    useConfirmModal();

  const handleEndService = useCallback(() => {
    if (isScheduledService(serviceItem) && !isConfirmed) {
      openModal();

      return;
    }

    updateServiceItemQuantity(0);
  }, [isConfirmed, openModal, serviceItem, updateServiceItemQuantity]);

  useEffect(() => {
    if (isConfirmed && prevIsConfirmed !== isConfirmed) {
      handleEndService();
    }
  }, [isConfirmed, prevIsConfirmed, handleEndService]);

  return {
    isModalOpen,
    closeModal,
    confirm,
    endService: handleEndService,
  };
};
