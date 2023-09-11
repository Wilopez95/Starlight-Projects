import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { hasPdfExtension } from '@root/helpers';

import { transition, variants } from '../animationConfig';
import { PdfPreviewWrapper } from '../styles';
import { ITabProps } from '../types';

import styles from '../css/styles.scss';

export const MediaTab: React.FC<ITabProps> = ({ currentMediaFile, direction }) => {
  return (
    <div className={styles.modalPreview} aria-label={currentMediaFile?.category}>
      {currentMediaFile ? (
        hasPdfExtension(currentMediaFile.src) ? (
          <PdfPreviewWrapper src={currentMediaFile.src} />
        ) : (
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              className={styles.modalImage}
              alt={`${currentMediaFile.category} ${currentMediaFile.fileName} preview`}
              src={currentMediaFile.src}
              key={currentMediaFile.src}
              variants={variants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            />
          </AnimatePresence>
        )
      ) : null}
    </div>
  );
};
