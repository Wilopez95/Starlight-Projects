import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { Background } from '@root/common/QuickView/BaseQuickView/Background';
import { backgroundVariants } from '@root/common/QuickView/BaseQuickView/variants';
import { useBoolean, useOverlayController } from '@root/hooks';

import { SaveChangesBoundaryConfirmModal } from './ConfirmModal/ConfirmModal';
import * as Styles from './styles';
import { ISaveChangesBoundary } from './types';

export const SaveChangesBoundary: React.FC<ISaveChangesBoundary> = ({
  className,
  children,
  dirty,
  onLeaveModal,
}) => {
  const [zIndex, register, unRegister] = useOverlayController();
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [isModalOpen, handleOpenModal, handleModalClose] = useBoolean(false);

  useEffect(() => {
    setIsOverlayActive(dirty);
    if (dirty) {
      register();
    } else {
      unRegister();
    }

    return () => {
      if (dirty) {
        unRegister();
      } else {
        register();
      }
    };
  }, [dirty, register, unRegister]);

  const handleLeaveClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      onLeaveModal(e);
      handleModalClose();
    },
    [handleModalClose, onLeaveModal],
  );

  return (
    <>
      <AnimatePresence>
        {isOverlayActive ? (
          <Background
            onClick={handleOpenModal}
            variants={backgroundVariants}
            initial="close"
            animate="open"
            exit="close"
            zIndex={zIndex - 11}
          />
        ) : null}
      </AnimatePresence>
      <Styles.BoundaryContainer className={className} zIndex={zIndex - 10}>
        {children}
        <SaveChangesBoundaryConfirmModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onLeave={handleLeaveClick}
        />
      </Styles.BoundaryContainer>
    </>
  );
};
