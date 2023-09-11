import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import cx from 'classnames';

import { CrossIcon } from '@root/assets';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useOverlayController } from '@root/hooks';

import { unsavedChangesContext } from './UnsavedChangesModal/context';
import { IUnsavedChangesModalContext } from './UnsavedChangesModal/types';
import * as Styles from './styles';
import { IModal } from './types';

import styles from './css/styles.scss';

export const Modal: React.FC<IModal> = ({
  isOpen,
  onClose,
  className,
  overlayClassName,
  children,
  onOpened,
  shouldCloseOnEsc = true,
}) => {
  const { t } = useTranslation();
  const [zIndex, register, unRegister] = useOverlayController();

  useEffect(() => {
    if (isOpen) {
      register();
    }
  }, [isOpen, register]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        onClose?.();
      }
    },
    [onClose],
  );

  const overlayRender = useMemo(() => {
    return (props: React.ComponentPropsWithRef<'div'>, element: React.ReactElement) => (
      <Styles.Overlay {...props} zIndex={zIndex}>
        {element}
      </Styles.Overlay>
    );
  }, [zIndex]);

  const isDirtyRef = useRef<boolean>(false);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);

  const handleClose = useCallback(() => {
    const shouldOpenUnsavedModal = isDirtyRef.current;

    if (shouldOpenUnsavedModal) {
      setIsUnsavedChangesModalOpen(shouldOpenUnsavedModal);
    } else {
      onClose?.();
    }
  }, [onClose]);

  const handleUnsavedChangesConfirm = useCallback(() => {
    setIsUnsavedChangesModalOpen(false);
  }, []);

  const handleUnsavedChangesClose = useCallback(() => {
    setIsUnsavedChangesModalOpen(false);
    onClose?.();
  }, [onClose]);

  const unsavedChangesModalContext: IUnsavedChangesModalContext = useMemo(
    () => ({
      isOpen: isUnsavedChangesModalOpen,
      isDirtyRef,
      confirm: handleUnsavedChangesConfirm,
      close: handleUnsavedChangesClose,
    }),
    [isUnsavedChangesModalOpen, handleUnsavedChangesConfirm, handleUnsavedChangesClose],
  );

  return (
    <unsavedChangesContext.Provider value={unsavedChangesModalContext}>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={handleClose}
        overlayClassName={cx(overlayClassName, styles.overlay)}
        className={cx(className, styles.modal)}
        onAfterOpen={onOpened}
        overlayElement={overlayRender}
        shouldCloseOnEsc={shouldCloseOnEsc}
        onAfterClose={unRegister}
      >
        {onClose ? (
          <CrossIcon
            className={styles.closeIcon}
            tabIndex={0}
            role="button"
            aria-label={t('Text.Close')}
            onClick={handleClose}
            onKeyDown={handleKeyDown}
          />
        ) : null}
        {children}
      </ReactModal>
    </unsavedChangesContext.Provider>
  );
};
