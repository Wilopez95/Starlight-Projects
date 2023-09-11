import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickOutHandler, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

import { LoadingIndicator, NothingToShowSidebar } from '@root/common';

import { DEFAULT_TABLE_HEADER_HEIGHT, DEFAULT_WIDTH, getOffsets, variants } from './helpers';
import { CrossIcon, LoadingIndicatorWrapper } from './styles';
import { IQuickView } from './types';

import styles from './css/styles.scss';

const I18N_ROOT_PATH = 'Text.';

export const QuickView: React.FC<IQuickView> = ({
  parentRef,
  condition,
  children,
  clickOutHandler,
  confirmModal,
  clickOutSelectors = [],
  clickOutContainers = [],
  quickViewClassName,
  closeOnClickOut = true,
  isAnimated = true,
  showTableHeader = false,
  id,
  loading,
  error,
}) => {
  const { t } = useTranslation();
  const [scrollContainerHeight, setScrollContainerHeight] = useState(0);
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

  const handleClickOut = useCallback(() => {
    if (closeOnClickOut && condition) {
      if (!confirmModal) {
        clickOutHandler?.();
      }
    }
  }, [clickOutHandler, closeOnClickOut, condition, confirmModal]);

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
  }, [debounceCallback, resizeCallback, children]);

  const childrenProps = useMemo(
    () => ({
      scrollContainerHeight,
      onAddRef,
      quickViewStyles: styles,
    }),
    [onAddRef, scrollContainerHeight],
  );

  return (
    <AnimatePresence>
      {condition ? (
        <ClickOutHandler
          subContainers={clickOutContainers}
          onClickOut={handleClickOut}
          clickOutSelectors={clickOutSelectors}
          skipModal
        >
          <motion.div
            className={cx(styles.descriptionPanel, quickViewClassName)}
            variants={isAnimated ? variants : undefined}
            style={{
              width: DEFAULT_WIDTH,
              top: parentOffsetTop + (showTableHeader ? DEFAULT_TABLE_HEADER_HEIGHT : 0),
              height: document.body.clientHeight - parentOffsetTop,
            }}
            id={id}
            initial="close"
            animate="open"
            exit="close"
          >
            {clickOutHandler ? (
              <Layouts.Box ref={onAddRef} position="relative">
                <Layouts.Flex alignItems="center" justifyContent="flex-end">
                  <Layouts.Padding padding="1" onClick={handleClickOut}>
                    <CrossIcon cursor="pointer" />
                  </Layouts.Padding>
                </Layouts.Flex>
              </Layouts.Box>
            ) : null}
            {loading ? (
              <LoadingIndicatorWrapper>
                <LoadingIndicator text={t(`${I18N_ROOT_PATH}Loading`)} />
              </LoadingIndicatorWrapper>
            ) : null}
            {error && !loading ? (
              <NothingToShowSidebar text={t(`${I18N_ROOT_PATH}SomethingWrong`)} />
            ) : null}
            {error ? null : children(childrenProps)}
          </motion.div>
        </ClickOutHandler>
      ) : null}
    </AnimatePresence>
  );
};
