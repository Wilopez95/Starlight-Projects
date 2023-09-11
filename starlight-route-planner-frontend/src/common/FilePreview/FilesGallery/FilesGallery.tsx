import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Modal,
  PdfPlaceholderIcon,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { noop } from 'lodash-es';

import { hasPdfExtension } from '@root/helpers';

import { MetaSection } from '../FilePreviewMetaSection/FilePreviewMetaSection';

import { transition, variants } from './animationConfig';
import { IFilesGallery, IFilesGalleryHandle } from './types';

import styles from './css/styles.scss';

export const FilesGallery = forwardRef<IFilesGalleryHandle, IFilesGallery>(
  ({ media, onRemove }, ref) => {
    const [activeIndex, setActiveIndex] = useState<null | number>(null);
    const [direction, setDirection] = useState<'left' | 'right'>('left');

    const handleClose = useCallback(() => {
      setActiveIndex(null);
    }, []);

    const handleNext = useCallback(() => {
      setActiveIndex(s => {
        if (s !== null) {
          setDirection('right');

          return s + 1;
        }

        return s;
      });
    }, []);

    const handlePrev = useCallback(() => {
      setActiveIndex(s => {
        if (s !== null) {
          setDirection('left');

          return s - 1;
        }

        return s;
      });
    }, []);

    const handleOpen = useCallback((index: number) => {
      setActiveIndex(index);
    }, []);

    const currentItem = activeIndex === null ? null : media[activeIndex];

    useImperativeHandle(
      ref,
      () => {
        return {
          activeIndex,
          handleClose,
          handleOpen,
        };
      },
      [handleOpen, activeIndex, handleClose],
    );

    return (
      <Modal className={styles.modal} isOpen={activeIndex !== null} onClose={handleClose}>
        {currentItem && (
          <div className={styles.modalContainer}>
            <MetaSection
              fileName={currentItem.fileName}
              author={currentItem.author}
              src={currentItem.src}
              timestamp={currentItem.timestamp}
              onRemove={onRemove}
            />
            <div
              className={cx(styles.arrow, {
                [styles.disabled]: activeIndex === 0,
              })}
              onClick={activeIndex === 0 ? noop : handlePrev}
            >
              <ArrowLeftIcon />
            </div>

            <div className={styles.modalPreview} aria-label={currentItem.category}>
              {currentItem.isPdf || hasPdfExtension(currentItem.src) ? (
                <PdfPlaceholderIcon className={styles.pdfPlaceholder} />
              ) : (
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    className={styles.modalImage}
                    alt={`${currentItem.category} ${currentItem.fileName} preview`}
                    src={currentItem.src}
                    key={currentItem.src}
                    variants={variants}
                    custom={direction}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                  />
                </AnimatePresence>
              )}
            </div>
            <div
              className={cx(styles.arrow, styles.rightArrow, {
                [styles.disabled]: activeIndex === media.length - 1,
              })}
              onClick={activeIndex === media.length - 1 ? noop : handleNext}
            >
              <ArrowRightIcon />
            </div>
          </div>
        )}
      </Modal>
    );
  },
);
