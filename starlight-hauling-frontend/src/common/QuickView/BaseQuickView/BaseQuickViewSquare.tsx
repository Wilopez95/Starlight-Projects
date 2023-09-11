import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useHistory } from 'react-router';
import { AnimatePresence } from 'framer-motion';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useOverlayController } from '@root/hooks';

import { Background } from './Background';
import { getModalContentElement, getModalOverlayElement } from './helpers';
import * as Styles from './styles';
import { IBaseQuickView } from './types';
import { backgroundVariants, quickViewVariants } from './variants';

const BaseQuickViewSquare: React.FC<IBaseQuickView> = ({
  isOpen,
  children,
  onClose,
  onAfterClose,
  clickOutContainers,
  clickOutSelectors: baseClickOutSelectors = [],
  closeUrl,
  openUrl,
  overlay = false,
  disableCross = false,
  size = 'three-quarters',
}) => {
  const [zIndex, register, unRegister] = useOverlayController();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { t } = useTranslation();

  const history = useHistory();

  const handleAfterClose = useCallback(() => {
    //browser location (not a bug)
    if (closeUrl && location.pathname === openUrl) {
      history.push(closeUrl);
    }
    onAfterClose();
    setIsModalOpen(false);
    unRegister();
  }, [closeUrl, history, onAfterClose, openUrl, unRegister]);

  useEffect(() => {
    if (isOpen) {
      register();
      setIsModalOpen(true);

      if (openUrl) {
        history.push(openUrl);
      }
    }
  }, [history, isOpen, openUrl, register]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onClose();
      }
    },
    [onClose],
  );

  const clickOutSelectors = useMemo(() => {
    const arr = Array.isArray(baseClickOutSelectors)
      ? baseClickOutSelectors
      : [baseClickOutSelectors];

    return [...arr, '.flatpickr-calendar'];
  }, [baseClickOutSelectors]);

  return (
    <ReactModal
      isOpen={isModalOpen}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      overlayElement={getModalOverlayElement}
      contentElement={getModalContentElement}
    >
      <AnimatePresence>
        {overlay && isOpen ? (
          <Background
            onClick={onClose}
            variants={backgroundVariants}
            initial="close"
            animate="open"
            exit="close"
            zIndex={zIndex}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence onExitComplete={handleAfterClose}>
        {isOpen ? (
          <Styles.QuickViewClickOutHandler
            subContainers={clickOutContainers}
            onClickOut={onClose}
            clickOutSelectors={clickOutSelectors}
            skipModal
            zIndex={zIndex}
          >
            <Styles.QuickViewContainer
              $size={size}
              variants={quickViewVariants}
              initial="close"
              animate="open"
              exit="close"
              role="dialog"
              aria-modal="true"
            >
              <Styles.QuickViewContentContainer>
                {children}
                {!disableCross ? (
                  <Styles.CrossIcon
                    tabIndex={0}
                    role="button"
                    aria-label={t('Text.Close')}
                    onKeyDown={handleKeyDown}
                    onClick={onClose}
                  />
                ) : null}
              </Styles.QuickViewContentContainer>
            </Styles.QuickViewContainer>
          </Styles.QuickViewClickOutHandler>
        ) : null}
      </AnimatePresence>
    </ReactModal>
  );
};

export default memo(BaseQuickViewSquare);
