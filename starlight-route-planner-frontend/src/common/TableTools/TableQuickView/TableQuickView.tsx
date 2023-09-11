import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClickOutHandler, useBoolean } from '@starlightpro/shared-components';
import cx from 'classnames';
import { motion, Variants } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

import { UnsavedChangesModal } from './unsavedChanges/UnsavedChangesModal';
import { getOffsets, getWidth } from './helpers';
import { ITableQuickView } from './types';

import styles from './css/styles.scss';

export const variants: Variants = {
  close: {
    x: '100%',
    transition: {
      bounceDamping: 0,
      duration: 0.3,
    },
  },
  open: {
    x: 0,
    transition: {
      bounceDamping: 0,
      duration: 0.3,
    },
  },
};

export const TableQuickView: React.FC<ITableQuickView> = ({
  parentRef,
  store,
  children,
  clickOutHandler,
  onCancel,
  confirmModal,
  confirmModalText,
  saveChanges,
  clickOutSelectors = [],
  clickOutContainers = [],
  quickViewClassName,
  size = 'default',
  closeOnClickOut = true,
}) => {
  const [scrollContainerHeight, setScrollContainerHeight] = useState(0);
  const [isModalOpen, openModal, closeModal] = useBoolean();

  const refs = useRef<HTMLElement[]>([]);

  const parentOffsetTop = parentRef.current?.offsetTop ?? 0;

  const onAddRef = useCallback((ref: HTMLElement | null) => {
    if (ref === null) {
      refs.current = [];
    } else {
      refs.current.push(ref);
    }
  }, []);

  const resizeCallback = useCallback(() => {
    setScrollContainerHeight(
      document.body.clientHeight - parentOffsetTop - getOffsets(refs.current),
    );
  }, [parentOffsetTop]);

  const debounceCallback = useDebouncedCallback(resizeCallback, 16);

  const handleCancel = useCallback(
    (showModal = true) => {
      if (showModal && confirmModal && !isModalOpen) {
        openModal();

        return;
      }
      if (isModalOpen) {
        closeModal();
      }

      store?.toggleQuickView(false);
      onCancel?.();
    },
    [closeModal, confirmModal, isModalOpen, onCancel, openModal, store],
  );

  const handleDuplicate = useCallback(() => {
    if (confirmModal) {
      openModal();
    } else {
      handleCancel();
    }
  }, [confirmModal, handleCancel, openModal]);

  const handleClickOut = useCallback(() => {
    if (closeOnClickOut) {
      handleCancel();
      if (!confirmModal) {
        clickOutHandler?.();
      }
    }
  }, [clickOutHandler, closeOnClickOut, confirmModal, handleCancel]);

  const childrenProps = useMemo(() => {
    return {
      scrollContainerHeight,
      onCancel: handleCancel,
      onDuplicate: handleDuplicate,
      onAddRef,
      tableQuickViewStyles: styles,
    };
  }, [handleCancel, handleDuplicate, onAddRef, scrollContainerHeight]);

  const handleSubmit = useCallback(() => {
    saveChanges?.(handleCancel, closeModal);
  }, [handleCancel, saveChanges, closeModal]);

  useEffect(() => {
    const handleEscapePress = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        handleClickOut();
      }
    };

    document.addEventListener('keydown', handleEscapePress);

    return () => {
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, [handleClickOut]);

  useEffect(() => {
    window.addEventListener('resize', debounceCallback);
    resizeCallback();

    return () => {
      window.removeEventListener('resize', debounceCallback);
    };
  }, [debounceCallback, resizeCallback]);

  return (
    <>
      <UnsavedChangesModal
        text={confirmModalText}
        isOpen={!!confirmModal && isModalOpen}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
      <ClickOutHandler
        subContainers={clickOutContainers}
        onClickOut={handleClickOut}
        clickOutSelectors={clickOutSelectors}
        skipModal
      >
        <motion.div
          className={cx(styles.descriptionPanel, quickViewClassName)}
          variants={variants}
          style={{
            width: getWidth(parentRef.current, size),
            top: parentOffsetTop,
            height: document.body.clientHeight - parentOffsetTop,
          }}
          initial="close"
          animate="open"
          exit="close"
        >
          {children(childrenProps)}
        </motion.div>
      </ClickOutHandler>
    </>
  );
};
