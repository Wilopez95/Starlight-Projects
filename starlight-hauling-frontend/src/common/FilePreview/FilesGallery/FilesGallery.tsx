import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { noop } from 'lodash-es';

import { ArrowLeftIcon, ArrowRightIcon } from '@root/assets';
import { handleEnterOrSpaceKeyDown, parseDate } from '@root/helpers';
import { IAttachment } from '@root/types';

import { Modal } from '../../Modal/Modal';
import { Typography } from '../../Typography/Typography';
import { MetaSection } from '../FilePreviewMetaSection/FilePreviewMetaSection';
import { PdfViewer } from '../PdfViewer/PdfViewer';

import { transition, variants } from './animationConfig';
import { FileGalleryMediaItem, IFilesGallery, IFilesGalleryHandle } from './types';

import styles from './css/styles.scss';

export const FilesGallery = forwardRef<IFilesGalleryHandle, IFilesGallery>(
  ({ media, onRemove }, ref) => {
    const [activeIndex, setActiveIndex] = useState<null | number>(null);
    const [direction, setDirection] = useState<'left' | 'right'>('left');
    const { t } = useTranslation();

    // file added by user cannot be sent via email, until it'll be uploaded
    const pendingFiles = useMemo(
      () => media.some((f: FileGalleryMediaItem | IAttachment) => f.src?.startsWith('blob:')),
      [media],
    );

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

    const handleOnNextKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
        if (handleEnterOrSpaceKeyDown(e)) {
          handleNext();
        }
      },
      [handleNext],
    );

    const handlePrev = useCallback(() => {
      setActiveIndex(s => {
        if (s !== null) {
          setDirection('left');

          return s - 1;
        }

        return s;
      });
    }, []);

    const handleOnPrevKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
        if (handleEnterOrSpaceKeyDown(e)) {
          handlePrev();
        }
      },
      [handlePrev],
    );

    const handleOpen = useCallback((index: number | null = 0) => {
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

    const getPreview = useCallback(() => {
      if (!currentItem) {
        return null;
      }

      if (currentItem.fileIsNoViewable) {
        return (
          <div className={styles.noViewableFile}>
            <Typography className={styles.fileExtension} color="primary" shade="light">
              {currentItem.extension?.substr(1).toUpperCase()}
            </Typography>
          </div>
        );
      }

      return currentItem.isPdf ||
        currentItem.fileName?.endsWith('pdf') ||
        currentItem.src?.endsWith('pdf') ? (
        <PdfViewer url={currentItem.src} />
      ) : (
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            className={styles.modalImage}
            alt={`${currentItem.category} ${currentItem.fileName} preview`}
            src={currentItem.src}
            key={`${currentItem.src ?? ''}-${activeIndex ?? 0}`}
            variants={variants}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            loading="lazy"
          />
        </AnimatePresence>
      );
    }, [currentItem, activeIndex, direction]);

    return (
      <Modal className={styles.modal} isOpen={activeIndex !== null} onClose={handleClose}>
        {currentItem ? (
          <div className={styles.modalContainer}>
            <MetaSection
              fileName={currentItem.fileName}
              author={currentItem.author}
              hideAuthor={currentItem.hideAuthor}
              src={currentItem?.src}
              timestamp={parseDate(currentItem.timestamp)}
              disableSendEmail={pendingFiles}
              onRemove={onRemove}
            />
            <div
              className={cx(styles.arrow, {
                [styles.disabled]: activeIndex === 0,
              })}
              onClick={activeIndex === 0 ? noop : handlePrev}
            >
              <ArrowLeftIcon
                aria-label={t('Text.Previous')}
                role="button"
                tabIndex={activeIndex === 0 ? -1 : 0}
                onKeyDown={handleOnPrevKeyDown}
              />
            </div>

            <div className={styles.modalPreview} aria-label={currentItem?.category}>
              {getPreview()}
            </div>
            <div
              className={cx(styles.arrow, styles.rightArrow, {
                [styles.disabled]: activeIndex === media.length - 1,
              })}
              onClick={activeIndex === media.length - 1 ? noop : handleNext}
            >
              <ArrowRightIcon
                role="button"
                aria-label={t('Text.Next')}
                tabIndex={activeIndex === media.length - 1 ? -1 : 0}
                onKeyDown={handleOnNextKeyDown}
              />
            </div>
          </div>
        ) : null}
      </Modal>
    );
  },
);
