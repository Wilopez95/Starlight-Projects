import React, { useCallback, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useBoolean, useStores } from '@root/hooks';

import BaseQuickViewSquare from '../BaseQuickView/BaseQuickViewSquare';

import { IQuickViewContext, quickViewContext } from './context';
import { QuickViewProps } from './types';

//Store based quickView
const QuickViewSquare: React.FC<QuickViewProps> = ({
  children,
  onClose,
  onAfterClose,
  store,
  shouldDeselect = true,
  overlay = false,
  disableAutoOverlay = false,
  ...baseQuickViewProps
}) => {
  const [isModalOpen, handleOpenModal, handleCloseModal] = useBoolean(false);
  const [isOverlayShown, setIsOverlayShown] = useState(false);
  const shouldOpenModal = useRef(false);
  const { systemConfigurationStore } = useStores();

  const handleShouldOpenModal = useCallback((newValue: boolean) => {
    shouldOpenModal.current = newValue;
  }, []);

  const handleShouldShowOverlay = useCallback(
    (newValue: boolean) => {
      if (disableAutoOverlay) {
        return;
      }

      setIsOverlayShown(newValue);
    },
    [disableAutoOverlay],
  );

  const handleClose = useCallback(() => {
    if (systemConfigurationStore.isPreDuplicating) {
      systemConfigurationStore.togglePreDuplicating(false);
      systemConfigurationStore.toggleDuplicating(true);

      return;
    }

    if (systemConfigurationStore.isCreating) {
      systemConfigurationStore.toggleCreating(false);
    }

    if (onClose) {
      onClose();
    } else {
      store.toggleQuickView(false);
    }
  }, [onClose, store, systemConfigurationStore]);

  const handleAfterClose = useCallback(() => {
    if (shouldDeselect) {
      store.unSelectEntity(onAfterClose);
    } else {
      onAfterClose?.();
    }
    handleCloseModal();
  }, [shouldDeselect, handleCloseModal, store, onAfterClose]);

  const handleCloseWithModal = useCallback(() => {
    if (shouldOpenModal.current) {
      handleOpenModal();

      return;
    }

    handleClose();
  }, [handleClose, handleOpenModal]);

  const handleDuplicate = useCallback(() => {
    systemConfigurationStore.togglePreDuplicating(true);
    if (shouldOpenModal.current) {
      handleOpenModal();
    } else {
      handleClose();
    }
  }, [handleClose, handleOpenModal, systemConfigurationStore]);

  const contextData: IQuickViewContext = useMemo(
    () => ({
      closeQuickView: handleCloseWithModal,
      closeModal: handleCloseModal,
      shouldOpenModal: handleShouldOpenModal,
      forceCloseQuickView: handleClose,
      shouldShowOverlay: handleShouldShowOverlay,
      onDuplicate: handleDuplicate,
      isModalOpen,
    }),
    [
      handleClose,
      handleCloseModal,
      handleCloseWithModal,
      handleDuplicate,
      handleShouldOpenModal,
      handleShouldShowOverlay,
      isModalOpen,
    ],
  );

  return (
    <quickViewContext.Provider value={contextData}>
      <BaseQuickViewSquare
        {...baseQuickViewProps}
        overlay={overlay ? overlay : isOverlayShown}
        onAfterClose={handleAfterClose}
        onClose={handleCloseWithModal}
      >
        {children}
      </BaseQuickViewSquare>
    </quickViewContext.Provider>
  );
};

export default observer(QuickViewSquare);
